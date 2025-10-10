// generate_keypair.rs
// Comprehensive utility to generate a complete wallet keypair for CNetAI blockchain

use cnetai_core::crypto::dilithium::MLDsaKeyPair;
use cnetai_core::crypto::kyber::KyberKeyPair;
use cnetai_core::crypto::stealth_address::StealthAddress;
use cnetai_core::wallet::deterministic::DeterministicWallet;
use hex;
use rand::RngCore;

fn main() {
    println!("Generating a complete wallet keypair for CNetAI blockchain...");
    
    // 1. Generate a new deterministic wallet
    let mut wallet = DeterministicWallet::generate().expect("Failed to generate deterministic wallet");
    
    // 2. Get the seed and generate mnemonic
    let seed = wallet.get_seed();
    println!("\nSeed (hex): {}", hex::encode(seed));
    
    // 3. Generate mnemonic phrase (12 words)
    let mnemonic = wallet.to_mnemonic().expect("Failed to generate mnemonic");
    println!("\nMnemonic Phrase (12 words): {}", mnemonic.join(" "));
    
    // 4. Derive keypair at default path
    let (mldsa_keypair, kyber_keypair) = wallet.derive_keypair("m/44'/1234'/0'/0/0").expect("Failed to derive keypair");
    
    // 5. Get the public key
    let public_key = mldsa_keypair.public_key_bytes();
    println!("\nPublic Key (hex): {}", hex::encode(&public_key));
    
    // 6. Generate the address (simplified - in practice this would be more complex)
    let address = generate_address(&public_key);
    println!("\nAddress: {}", address);
    
    // 7. Generate spending key (private key for spending)
    let spending_key = mldsa_keypair.secret_key_bytes();
    println!("\nSpending Key (hex): {}", hex::encode(&spending_key));
    
    // 8. Generate viewing key (public key for scanning)
    let viewing_key = kyber_keypair.public_key_bytes();
    println!("\nViewing Key (hex): {}", hex::encode(&viewing_key));
    
    // 9. Create a stealth address
    let stealth_address = StealthAddress::new(&kyber_keypair, &kyber_keypair);
    let stealth_address_str = format!("{}{}", 
        hex::encode(&stealth_address.scan_public_key),
        hex::encode(&stealth_address.spend_public_key)
    );
    println!("\nStealth Address: {}", stealth_address_str);
    
    println!("\nKeypair generated successfully!");
    println!("\nIMPORTANT: Store your mnemonic phrase securely. It is the only way to recover your wallet.");
    println!("You can use this mnemonic to restore your wallet in any CNetAI wallet application.");
}

/// Generate an address from a public key (simplified implementation)
fn generate_address(public_key: &[u8]) -> String {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(public_key);
    let result = hasher.finalize();
    hex::encode(&result[..20]) // Use first 20 bytes as address (like Ethereum)
}