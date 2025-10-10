//! Simplified CNetAI WASM Library for PWA

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

/// A simplified wallet structure designed to be used in a WASM environment.
#[wasm_bindgen]
pub struct WasmWallet {
    public_key: String,
    encrypted_data: String,
    // This will hold the decrypted data when the wallet is unlocked.
    unlocked_data: Option<String>,
}

#[wasm_bindgen]
impl WasmWallet {
    /// Creates a new wallet with a password
    #[wasm_bindgen(constructor)]
    pub fn new(password: &str) -> WasmWallet {
        // In a real implementation, we would generate a keypair here
        // For this simplified version, we'll just use a placeholder
        let public_key = format!("pubkey_{}", password.chars().take(8).collect::<String>());
        
        WasmWallet {
            public_key,
            encrypted_data: "encrypted_data_placeholder".to_string(),
            unlocked_data: None,
        }
    }

    /// Unlocks the wallet (simplified version)
    pub fn unlock(&mut self, _password: &str) -> bool {
        // In a real implementation, we would decrypt the data here
        self.unlocked_data = Some("unlocked_data_placeholder".to_string());
        true
    }

    /// Locks the wallet
    pub fn lock(&mut self) {
        self.unlocked_data = None;
    }

    /// Checks if the wallet is currently unlocked
    pub fn is_unlocked(&self) -> bool {
        self.unlocked_data.is_some()
    }

    /// Returns the public key
    pub fn get_public_key(&self) -> String {
        self.public_key.clone()
    }

    /// Signs a message (simplified version)
    pub fn sign_message(&self, message: &str) -> Result<String, JsValue> {
        if !self.is_unlocked() {
            return Err(JsValue::from_str("Wallet is locked."));
        }

        // In a real implementation, we would sign the message here
        Ok(format!("signature_{}", message.chars().take(16).collect::<String>()))
    }

    /// Exports the wallet data as a JSON string
    pub fn to_json(&self) -> String {
        #[derive(Serialize)]
        struct SerializableWallet {
            public_key: String,
            encrypted_data: String,
        }

        let data = SerializableWallet {
            public_key: self.public_key.clone(),
            encrypted_data: self.encrypted_data.clone(),
        };

        serde_json::to_string(&data).unwrap_or_default()
    }

    /// Imports a wallet from a JSON string
    #[wasm_bindgen(js_name = fromJson)]
    pub fn from_json(json_str: &str) -> Result<WasmWallet, JsValue> {
        #[derive(Deserialize)]
        struct SerializableWallet {
            public_key: String,
            encrypted_data: String,
        }

        let data: SerializableWallet = serde_json::from_str(json_str)
            .map_err(|e| JsValue::from_str(&format!("JSON deserialization error: {}", e)))?;

        Ok(WasmWallet {
            public_key: data.public_key,
            encrypted_data: data.encrypted_data,
            unlocked_data: None,
        })
    }
}