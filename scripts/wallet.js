// Wallet integration with WASM signer
class CNetAIWallet {
    constructor() {
        this.wallet = null;
        this.isWasmLoaded = false;
    }

    async init() {
        try {
            // Load the WASM module
            const wasmModule = await import('../cnetai-wasm-signer/pkg/cnetai_wasm_signer.js');
            await wasmModule.default();
            this.wasm = wasmModule;
            this.isWasmLoaded = true;
            console.log('WASM signer loaded successfully');
        } catch (error) {
            console.error('Failed to load WASM signer:', error);
            throw new Error('Failed to initialize wallet: ' + error.message);
        }
    }

    async createWallet(password) {
        if (!this.isWasmLoaded) {
            await this.init();
        }

        try {
            this.wallet = new this.wasm.WasmWallet(password);
            return {
                publicKey: this.wallet.get_public_key(),
                walletData: this.wallet.to_json()
            };
        } catch (error) {
            console.error('Failed to create wallet:', error);
            throw new Error('Failed to create wallet: ' + error.message);
        }
    }

    async importWallet(walletDataJson, password) {
        if (!this.isWasmLoaded) {
            await this.init();
        }

        try {
            this.wallet = this.wasm.WasmWallet.fromJson(walletDataJson);
            const success = this.wallet.unlock(password);
            return success;
        } catch (error) {
            console.error('Failed to import wallet:', error);
            throw new Error('Failed to import wallet: ' + error.message);
        }
    }

    async unlockWallet(password) {
        if (!this.wallet) {
            throw new Error('No wallet loaded');
        }

        try {
            return this.wallet.unlock(password);
        } catch (error) {
            console.error('Failed to unlock wallet:', error);
            throw new Error('Failed to unlock wallet: ' + error.message);
        }
    }

    lockWallet() {
        if (this.wallet) {
            this.wallet.lock();
        }
    }

    isUnlocked() {
        return this.wallet ? this.wallet.is_unlocked() : false;
    }

    getPublicKey() {
        if (!this.wallet) {
            throw new Error('No wallet loaded');
        }
        return this.wallet.get_public_key();
    }

    async signMessage(message) {
        if (!this.wallet) {
            throw new Error('No wallet loaded');
        }

        if (!this.wallet.is_unlocked()) {
            throw new Error('Wallet is locked');
        }

        try {
            return this.wallet.sign_message(message);
        } catch (error) {
            console.error('Failed to sign message:', error);
            throw new Error('Failed to sign message: ' + error.message);
        }
    }
}

// Export as a singleton instance
const walletInstance = new CNetAIWallet();
export default walletInstance;