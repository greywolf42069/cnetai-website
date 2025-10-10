//! CNetAI WASM Signing Library for PWA

use wasm_bindgen::prelude::*;
use cnetai_core::crypto::dilithium::MLDsaKeyPair;
use cnetai_core::blockchain::transaction::Transaction;

use aes_gcm::{aead::{Aead, KeyInit, OsRng}, Aes256Gcm, Nonce};
use argon2::{self, Argon2};
use pqcrypto_traits::sign::{SecretKey as SignSecretKey, PublicKey as SignPublicKey};
use rand::RngCore;

/// A wallet structure designed to be used in a WASM environment.
/// It holds the encrypted keypair and can perform signing operations
/// after being unlocked with a password.
#[wasm_bindgen]
pub struct WasmWallet {
    public_key: Vec<u8>,
    encrypted_secret_key: Vec<u8>,
    salt: Vec<u8>,
    nonce: Vec<u8>,
    // This will hold the decrypted secret key when the wallet is unlocked.
    // It is kept private and not exposed to wasm-bindgen.
    unlocked_secret_key: Option<Vec<u8>>,
}

#[wasm_bindgen]
impl WasmWallet {
    /// Creates a new wallet, encrypts it with the provided password,
    /// and returns it.
    #[wasm_bindgen(constructor)]
    pub fn new(password: &str) -> Result<WasmWallet, JsValue> {
        // 1. Generate ML-DSA keypair
        let keypair = MLDsaKeyPair::generate().map_err(|e| JsValue::from_str(&e.to_string()))?;
        let public_key = keypair.public_key_bytes();
        let secret_key = keypair.secret_key_bytes();

        // 2. Encrypt the secret key
        let mut salt = [0u8; 16];
        OsRng.fill_bytes(&mut salt);

        let argon2 = Argon2::default();
        let mut encryption_key = [0u8; 32];
        argon2.hash_password_into(password.as_bytes(), &salt, &mut encryption_key)
            .map_err(|_| JsValue::from_str("Password hashing failed"))?;

        let cipher = Aes256Gcm::new_from_slice(&encryption_key).map_err(|_| JsValue::from_str("Cipher creation failed"))?;
        let mut nonce = [0u8; 12];
        OsRng.fill_bytes(&mut nonce);
        let nonce_ga = Nonce::from_slice(&nonce);

        let encrypted_secret_key = cipher.encrypt(nonce_ga, secret_key.as_slice())
            .map_err(|_| JsValue::from_str("Encryption failed"))?;

        Ok(WasmWallet {
            public_key,
            encrypted_secret_key,
            salt: salt.to_vec(),
            nonce: nonce.to_vec(),
            unlocked_secret_key: None,
        })
    }

    /// Unlocks the wallet by decrypting the secret key with the password.
    /// Returns true on success, false on failure (e.g., wrong password).
    pub fn unlock(&mut self, password: &str) -> bool {
        let argon2 = Argon2::default();
        let mut encryption_key = [0u8; 32];
        if argon2.hash_password_into(password.as_bytes(), &self.salt, &mut encryption_key).is_err() {
            return false;
        }

        let cipher = match Aes256Gcm::new_from_slice(&encryption_key) {
            Ok(c) => c,
            Err(_) => return false,
        };

        let nonce = Nonce::from_slice(&self.nonce);
        match cipher.decrypt(nonce, self.encrypted_secret_key.as_slice()) {
            Ok(decrypted_sk) => {
                self.unlocked_secret_key = Some(decrypted_sk);
                true
            }
            Err(_) => {
                self.unlocked_secret_key = None;
                false
            }
        }
    }

    /// Locks the wallet by clearing the decrypted secret key from memory.
    pub fn lock(&mut self) {
        self.unlocked_secret_key = None;
    }

    /// Checks if the wallet is currently unlocked.
    pub fn is_unlocked(&self) -> bool {
        self.unlocked_secret_key.is_some()
    }

    /// Returns the public key as a hex string.
    pub fn get_public_key_hex(&self) -> String {
        hex::encode(&self.public_key)
    }

    /// Signs a transaction represented as a JSON string.
    /// The wallet must be unlocked before calling this method.
    /// Returns the signed transaction as a JSON string.
    pub fn sign_transaction(&self, transaction_json: &str) -> Result<String, JsValue> {
        if !self.is_unlocked() {
            return Err(JsValue::from_str("Wallet is locked."));
        }

        let secret_key_bytes = self.unlocked_secret_key.as_ref().unwrap();

        // Deserialize the transaction from JSON
        let mut tx: Transaction = serde_json::from_str(transaction_json)
            .map_err(|e| JsValue::from_str(&format!("Failed to parse transaction JSON: {}", e)))?;

        // Reconstruct the ML-DSA secret key
        let mldsa_sk = pqcrypto_mldsa::mldsa87::SecretKey::from_bytes(secret_key_bytes)
            .map_err(|_| JsValue::from_str("Failed to reconstruct secret key."))?;

        // Get the data to be signed
        let signing_data = tx.get_signing_data();

        // Generate the signature
        let signature = mldsa_sk.sign(&signing_data);

        // Attach the signature to the first input (or as per your signing logic)
        if let Some(input) = tx.inputs.get_mut(0) {
            input.signature = Some(signature.into_bytes());
            input.public_key = self.public_key.clone();
        } else {
            return Err(JsValue::from_str("Transaction has no inputs to sign."));
        }

        // Serialize the signed transaction back to JSON
        serde_json::to_string(&tx)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize signed transaction: {}", e)))
    }

    /// Exports the encrypted wallet data as a JSON string for storage.
    pub fn to_json(&self) -> String {
        // A helper struct for serialization
        #[derive(serde::Serialize)]
        struct SerializableWallet<'a> {
            public_key: &'a str,
            encrypted_secret_key: &'a str,
            salt: &'a str,
            nonce: &'a str,
        }

        let data = SerializableWallet {
            public_key: &hex::encode(&self.public_key),
            encrypted_secret_key: &hex::encode(&self.encrypted_secret_key),
            salt: &hex::encode(&self.salt),
            nonce: &hex::encode(&self.nonce),
        };

        serde_json::to_string(&data).unwrap_or_default()
    }

    /// Imports an encrypted wallet from a JSON string.
    #[wasm_bindgen(js_name = fromJson)]
    pub fn from_json(json_str: &str) -> Result<WasmWallet, JsValue> {
        #[derive(serde::Deserialize)]
        struct SerializableWallet {
            public_key: String,
            encrypted_secret_key: String,
            salt: String,
            nonce: String,
        }

        let data: SerializableWallet = serde_json::from_str(json_str)
            .map_err(|e| JsValue::from_str(&format!("JSON deserialization error: {}", e)))?;

        Ok(WasmWallet {
            public_key: hex::decode(data.public_key).map_err(|_| JsValue::from_str("Invalid public_key hex"))?,
            encrypted_secret_key: hex::decode(data.encrypted_secret_key).map_err(|_| JsValue::from_str("Invalid encrypted_secret_key hex"))?,
            salt: hex::decode(data.salt).map_err(|_| JsValue::from_str("Invalid salt hex"))?,
            nonce: hex::decode(data.nonce).map_err(|_| JsValue::from_str("Invalid nonce hex"))?,
            unlocked_secret_key: None,
        })
    }
}