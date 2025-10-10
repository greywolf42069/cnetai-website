//! CNetAI WASM Signing Library for PWA

use wasm_bindgen::prelude::*;
use aes_gcm::{aead::{Aead, KeyInit, OsRng}, Aes256Gcm, Nonce};
use argon2::{self, Argon2};
use pqcrypto_mldsa::mldsa87::{keypair, open, sign, PublicKey, SecretKey, Signature};
use pqcrypto_traits::sign::{SecretKey as SignSecretKey, PublicKey as SignPublicKey};
use serde::{Deserialize, Serialize};

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
        let (pk, sk) = keypair();
        let public_key = pk.as_bytes().to_vec();
        let secret_key = sk.as_bytes().to_vec();

        // 2. Generate salt and nonce using web_sys crypto
        let salt = generate_random_bytes(16);
        let nonce_bytes = generate_random_bytes(12);

        let argon2 = Argon2::default();
        let mut encryption_key = [0u8; 32];
        argon2.hash_password_into(password.as_bytes(), &salt, &mut encryption_key)
            .map_err(|_| JsValue::from_str("Password hashing failed"))?;

        let cipher = Aes256Gcm::new_from_slice(&encryption_key).map_err(|_| JsValue::from_str("Cipher creation failed"))?;
        let nonce = Nonce::from_slice(&nonce_bytes);

        let encrypted_secret_key = cipher.encrypt(nonce, secret_key.as_slice())
            .map_err(|_| JsValue::from_str("Encryption failed"))?;

        Ok(WasmWallet {
            public_key,
            encrypted_secret_key,
            salt,
            nonce: nonce_bytes,
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

    /// Signs a message with the wallet's private key.
    /// The wallet must be unlocked before calling this method.
    /// Returns the signature as a hex string.
    pub fn sign_message(&self, message: &str) -> Result<String, JsValue> {
        if !self.is_unlocked() {
            return Err(JsValue::from_str("Wallet is locked."));
        }

        let secret_key_bytes = self.unlocked_secret_key.as_ref().unwrap();

        // Reconstruct the ML-DSA secret key
        let mldsa_sk = SecretKey::from_bytes(secret_key_bytes)
            .map_err(|_| JsValue::from_str("Failed to reconstruct secret key."))?;

        // Sign the message
        let signature = sign(message.as_bytes(), &mldsa_sk);

        // Return the signature as a hex string
        Ok(hex::encode(signature.as_bytes()))
    }

    /// Verifies a signature for a message using the wallet's public key.
    pub fn verify_signature(&self, message: &str, signature_hex: &str) -> Result<bool, JsValue> {
        let signature_bytes = hex::decode(signature_hex)
            .map_err(|_| JsValue::from_str("Invalid signature hex"))?;

        let signature = Signature::from_bytes(&signature_bytes)
            .map_err(|_| JsValue::from_str("Failed to reconstruct signature."))?;

        let pk = PublicKey::from_bytes(&self.public_key)
            .map_err(|_| JsValue::from_str("Failed to reconstruct public key."))?;

        let verified = open(signature, &pk).is_ok();
        Ok(verified)
    }

    /// Exports the encrypted wallet data as a JSON string for storage.
    pub fn to_json(&self) -> String {
        // A helper struct for serialization
        #[derive(Serialize)]
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
        #[derive(Deserialize)]
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

// Helper function to generate random bytes using web_sys
fn generate_random_bytes(length: usize) -> Vec<u8> {
    let mut bytes = vec![0u8; length];
    if let Ok(window) = web_sys::window() {
        if let Ok(crypto) = window.crypto() {
            if crypto.get_random_values_with_u8_array(&mut bytes).is_ok() {
                return bytes;
            }
        }
    }
    // Fallback - this shouldn't happen in a browser environment
    for i in 0..length {
        bytes[i] = (js_sys::Math::random() * 255.0) as u8;
    }
    bytes
}