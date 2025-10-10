// Main JavaScript for CNetAI Website

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    mobileMenuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Add functionality to open mobile menu when clicking the logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            // Only toggle mobile menu on smaller screens where the toggle is visible
            if (window.innerWidth <= 768) {
                nav.classList.toggle('active');
                // Also toggle the mobile menu toggle button state if it exists
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.toggle('active');
                }
            }
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                nav.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    });

    // Feature card hover effects
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 204, 255, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 30px rgba(0, 102, 204, 0.3)';
        });
    });

    // Token price animation
    const tokenPrice = document.querySelector('.price');
    if (tokenPrice) {
        setInterval(() => {
            // Simulate price change
            const currentPrice = parseFloat(tokenPrice.textContent.replace('$', ''));
            const change = (Math.random() - 0.5) * 0.02;
            const newPrice = currentPrice * (1 + change);
            tokenPrice.textContent = '$' + newPrice.toFixed(4);
            
            // Add visual effect for price change
            tokenPrice.style.textShadow = change >= 0 
                ? '0 0 20px rgba(0, 255, 255, 0.8)' 
                : '0 0 20px rgba(255, 0, 0, 0.8)';
            
            setTimeout(() => {
                tokenPrice.style.textShadow = '0 0 10px rgba(0, 204, 255, 0.5)';
            }, 500);
            
            // Update change percentage
            const changeElement = document.querySelector('.change');
            const changePercent = (change * 100).toFixed(2);
            changeElement.textContent = (changePercent >= 0 ? '+' : '') + changePercent + '%';
            
            if (change >= 0) {
                changeElement.className = 'change positive';
                changeElement.style.animation = 'pulse-positive 0.5s';
            } else {
                changeElement.className = 'change negative';
                changeElement.style.animation = 'pulse-negative 0.5s';
            }
            
            // Reset animation
            setTimeout(() => {
                changeElement.style.animation = '';
            }, 500);
        }, 5000);
    }

    // Wallet connection functionality
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const disconnectWalletBtn = document.getElementById('disconnectWalletBtn');
    const walletAddress = document.getElementById('walletAddress');
    const tokenBalance = document.getElementById('tokenBalance');
    const walletModal = document.getElementById('walletModal');
    const walletSetupContainer = document.getElementById('walletSetupContainer');
    const closeModal = document.querySelector('.close');
    
    // Import the WASM wallet module
    import('./wallet.js').then(walletModule => {
        window.wallet = walletModule.default;
        console.log('Wallet module loaded successfully');
    }).catch(error => {
        console.error('Failed to load wallet module:', error);
        // Set wallet to null to indicate failure
        window.wallet = null;
    });
    
    // Check if wallet exists on page load and update header button
    window.addEventListener('load', async function() {
        // Update header button based on wallet state
        const headerConnectWalletBtn = document.getElementById('connectWallet');
        if (headerConnectWalletBtn) {
            if (hasWallet()) {
                headerConnectWalletBtn.textContent = 'Unlock Wallet';
            } else {
                headerConnectWalletBtn.textContent = 'Connect Wallet';
            }
        }
        
        // Also update the wallet section if it exists on this page
        if (hasWallet()) {
            // If wallet exists, update UI to show connected state
            const walletData = getWalletData();
            if (walletData && walletData.publicKey) {
                updateWalletUI(walletData.publicKey, '0 ASC'); // Show 0 ASC instead of fake value
            }
        }
    });
    
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', async function() {
            console.log('Connect wallet button clicked');
            // Add visual feedback
            this.style.animation = 'button-click 0.3s';
            
            // Check if wallet module is loaded
            if (!window.wallet) {
                console.error('Wallet module not loaded');
                alert('Wallet functionality is not available yet. Please try again in a moment.');
                return;
            }
            
            // Check if wallet file exists
            if (hasWallet()) {
                // Prompt to unlock existing wallet
                showUnlockWalletForm();
            } else {
                // Start wallet creation journey
                showWalletSetupForm();
            }
            
            // Show modal with safety check
            if (walletModal) {
                walletModal.style.display = 'block';
            } else {
                console.error('Wallet modal not found');
            }
        });
    }
    
    if (disconnectWalletBtn) {
        disconnectWalletBtn.addEventListener('click', function() {
            // Add visual feedback
            this.style.animation = 'button-click 0.3s';
            
            // Disconnect wallet
            disconnectWallet();
        });
    }
    
    // Handle the connect wallet button in the header
    const connectWallet = document.getElementById('connectWallet');
    if (connectWallet) {
        connectWallet.addEventListener('click', async function() {
            console.log('[DEBUG] Header connect wallet button clicked');
            
            // Add visual feedback
            this.style.animation = 'button-click 0.3s';
            
            // Check if wallet module is loaded
            if (!window.wallet) {
                console.warn('[WARN] Wallet module not loaded yet');
                alert('Wallet functionality is initializing. Please try again in a moment.');
                return;
            }
            
            console.log('[INFO] Wallet module is available, proceeding with connection');
            
            // Check if wallet file exists
            if (hasWallet()) {
                console.log('[INFO] Existing wallet found, showing unlock form');
                // Prompt to unlock existing wallet
                showUnlockWalletForm();
            } else {
                console.log('[INFO] No existing wallet found, showing setup form');
                // Start wallet creation journey
                showWalletSetupForm();
            }
            
            // Show modal with safety check
            if (walletModal) {
                walletModal.style.display = 'block';
                console.log('[DEBUG] Wallet modal displayed');
            } else {
                console.error('Wallet modal not found');
            }
        });
    }
    
    // Close modal when clicking on X
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (walletModal) {
                walletModal.style.display = 'none';
            }
        });
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (walletModal && event.target === walletModal) {
            walletModal.style.display = 'none';
        }
    });
    
    // Close modal with ESC key
    window.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && walletModal && walletModal.style.display === 'block') {
            walletModal.style.display = 'none';
        }
    });
    
    // Wallet utility functions
    function hasWallet() {
        // Check if wallet data exists in localStorage
        return localStorage.getItem('cnetai_wallet') !== null;
    }
    
    function getWalletData() {
        try {
            const walletData = localStorage.getItem('cnetai_wallet');
            return walletData ? JSON.parse(walletData) : null;
        } catch (e) {
            console.error('Error parsing wallet data:', e);
            return null;
        }
    }
    
    function saveWalletData(walletData) {
        try {
            localStorage.setItem('cnetai_wallet', JSON.stringify(walletData));
            return true;
        } catch (e) {
            console.error('Error saving wallet data:', e);
            return false;
        }
    }
    
    function updateWalletUI(publicKey, balance) {
        // Display shortened public key
        const shortKey = publicKey.length > 20 ? 
            publicKey.substring(0, 6) + '...' + publicKey.substring(publicKey.length - 4) : 
            publicKey;
        
        // Update wallet info on the current page if elements exist
        if (walletAddress) {
            walletAddress.textContent = shortKey;
        }
        if (tokenBalance) {
            tokenBalance.textContent = balance;
        }
        if (connectWalletBtn) {
            connectWalletBtn.textContent = 'Connected';
            connectWalletBtn.disabled = true;
            connectWalletBtn.style.background = 'linear-gradient(90deg, var(--accent-green), var(--accent-cyan))';
            connectWalletBtn.style.boxShadow = '0 0 30px rgba(0, 255, 102, 0.8)';
        }
        
        // Also update header button
        const headerConnectWalletBtn = document.getElementById('connectWallet');
        if (headerConnectWalletBtn) {
            headerConnectWalletBtn.textContent = 'Unlock Wallet';
        }
    }
    
    function disconnectWallet() {
        if (walletAddress) {
            walletAddress.textContent = 'Not connected';
        }
        if (tokenBalance) {
            tokenBalance.textContent = '0';
        }
        if (connectWalletBtn) {
            connectWalletBtn.textContent = 'Connect Wallet';
            connectWalletBtn.disabled = false;
            connectWalletBtn.style.background = 'linear-gradient(90deg, var(--secondary-blue), var(--accent-cyan))';
            connectWalletBtn.style.boxShadow = '0 0 15px rgba(0, 204, 255, 0.4)';
        }
        
        // Remove wallet data from localStorage
        localStorage.removeItem('cnetai_wallet');
        
        // Lock the WASM wallet if it exists
        if (window.wallet) {
            window.wallet.lockWallet();
        }
        
        // Also update header button
        const headerConnectWalletBtn = document.getElementById('connectWallet');
        if (headerConnectWalletBtn) {
            headerConnectWalletBtn.textContent = 'Connect Wallet';
        }
    }
    
    async function showUnlockWalletForm() {
        // Safety check for walletSetupContainer
        if (!walletSetupContainer) {
            console.error('walletSetupContainer not found');
            // Try to find it again in case it was added dynamically
            const tempWalletSetupContainer = document.getElementById('walletSetupContainer');
            if (!tempWalletSetupContainer) {
                console.error('Still cannot find walletSetupContainer');
                alert('Wallet setup container not found. Please refresh the page.');
                return;
            }
            // Reassign if found
            walletSetupContainer = tempWalletSetupContainer;
        }
        
        // Additional safety check for wallet module
        if (!window.wallet) {
            console.error('Wallet module not loaded');
            alert('Wallet functionality is not available yet. Please try again in a moment.');
            return;
        }
        
        walletSetupContainer.innerHTML = `
            <h2>Unlock Your Wallet</h2>
            <div class="wallet-setup-form">
                <div class="form-group">
                    <label for="unlockPassword">Password</label>
                    <input type="password" id="unlockPassword" placeholder="Enter your wallet password">
                </div>
                <div class="actions">
                    <button class="btn secondary-btn" id="cancelUnlockBtn">Cancel</button>
                    <button class="btn primary-btn" id="unlockWalletBtn">Unlock</button>
                </div>
            </div>
        `;
        
        // Add event listeners with safety checks
        const cancelUnlockBtn = document.getElementById('cancelUnlockBtn');
        const unlockWalletBtn = document.getElementById('unlockWalletBtn');
        
        if (cancelUnlockBtn) {
            cancelUnlockBtn.addEventListener('click', function() {
                if (walletModal) {
                    walletModal.style.display = 'none';
                }
            });
        }
        
        if (unlockWalletBtn) {
            unlockWalletBtn.addEventListener('click', async function() {
                const password = document.getElementById('unlockPassword') ? document.getElementById('unlockPassword').value : '';
                
                if (!password) {
                    alert('Please enter your password');
                    return;
                }
                
                try {
                    // Import the existing wallet
                    const walletDataJson = localStorage.getItem('cnetai_wallet');
                    if (!walletDataJson) {
                        alert('No wallet found');
                        return;
                    }
                    
                    // Parse the wallet data and extract the WASM wallet data
                    const walletData = JSON.parse(walletDataJson);
                    
                    // Additional safety check
                    if (!walletData.walletData) {
                        console.error('Wallet data is missing WASM wallet data');
                        alert('Wallet data is corrupted. Please create a new wallet.');
                        return;
                    }
                    
                    const success = await window.wallet.importWallet(walletData.walletData, password);
                    if (success) {
                        const publicKey = window.wallet.getPublicKey();
                        updateWalletUI(publicKey, '0 ASC'); // Use 0 ASC instead of fake value
                        
                        // Close modal safely
                        if (walletModal) {
                            walletModal.style.display = 'none';
                        }
                        
                        // Check if we're on the dashboard page
                        if (window.location.pathname.includes('dashboard')) {
                            // Update the dashboard UI directly
                            const walletAddressElement = document.getElementById('walletAddress');
                            const tokenBalanceElement = document.getElementById('tokenBalance');
                            
                            if (walletAddressElement) {
                                walletAddressElement.textContent = publicKey.substring(0, 16) + '...' + publicKey.substring(publicKey.length - 8);
                            }
                            if (tokenBalanceElement) {
                                tokenBalanceElement.textContent = '0 ASC';
                            }
                            
                            // Update header button
                            const headerConnectWalletBtn = document.getElementById('connectWallet');
                            if (headerConnectWalletBtn) {
                                headerConnectWalletBtn.textContent = 'Connected';
                                headerConnectWalletBtn.disabled = true;
                            }
                        } else {
                            // Redirect to dashboard for other pages
                            window.location.href = 'dashboard.html';
                        }
                    } else {
                        alert('Failed to unlock wallet. Incorrect password.');
                    }
                } catch (error) {
                    console.error('Error unlocking wallet:', error);
                    alert('Failed to unlock wallet: ' + error.message);
                }
            });
        }
    }
    
    function showRestoreWalletForm() {
        walletSetupContainer.innerHTML = `
            <h2>Restore Wallet</h2>
            <div class="wallet-setup-step active" id="step1">
                <div class="wallet-setup-form">
                    <div class="form-group">
                        <label for="accountName">Account Name</label>
                        <input type="text" id="accountName" placeholder="Enter account name">
                    </div>
                    <div class="actions">
                        <button class="btn secondary-btn" id="cancelSetupBtn">Cancel</button>
                        <button class="btn primary-btn" id="nextStepBtn">Next</button>
                    </div>
                </div>
            </div>
            
            <div class="wallet-setup-step" id="step2">
                <div class="wallet-setup-form">
                    <div id="seedWordsSection">
                        <div class="form-group">
                            <label>Enter Your Seed Words</label>
                            <textarea id="seedWords" placeholder="Enter your 12 or 24 seed words, separated by spaces"></textarea>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="btn secondary-btn" id="backStepBtn">Back</button>
                        <button class="btn primary-btn" id="nextStep2Btn">Next</button>
                    </div>
                </div>
            </div>
            
            <div class="wallet-setup-step" id="step3">
                <div class="wallet-setup-form">
                    <div class="form-group">
                        <label for="walletPassword">Password</label>
                        <input type="password" id="walletPassword" placeholder="Set a strong password">
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm your password">
                    </div>
                    <div class="actions">
                        <button class="btn secondary-btn" id="backStep2Btn">Back</button>
                        <button class="btn primary-btn" id="createWalletBtn">Restore Wallet</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for restore wallet form
        setupRestoreWalletFormListeners();
    }
    
    function showWalletSetupForm() {
        walletSetupContainer.innerHTML = `
            <h2>Create New Wallet</h2>
            <div class="wallet-setup-step active" id="step1">
                <div class="wallet-setup-form">
                    <div class="form-group">
                        <label for="accountName">Account Name</label>
                        <input type="text" id="accountName" placeholder="Enter account name">
                    </div>
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="importSeedCheckbox">
                        <label for="importSeedCheckbox">I have seed words to import</label>
                    </div>
                    <div class="actions">
                        <button class="btn secondary-btn" id="cancelSetupBtn">Cancel</button>
                        <button class="btn primary-btn" id="nextStepBtn">Next</button>
                    </div>
                </div>
            </div>
            
            <div class="wallet-setup-step" id="step2">
                <div class="wallet-setup-form">
                    <div id="seedWordsSection" style="display: none;">
                        <div class="form-group">
                            <label>Enter Your Seed Words</label>
                            <textarea id="seedWords" placeholder="Enter your 12 or 24 seed words, separated by spaces"></textarea>
                        </div>
                    </div>
                    <div id="generateKeysSection">
                        <div class="form-group">
                            <label>Your New Seed Words</label>
                            <div class="seed-words" id="generatedSeedWords">
                                <!-- Seed words will be generated here -->
                            </div>
                        </div>
                        <div class="form-group checkbox-group">
                            <input type="checkbox" id="seedWordsSaved">
                            <label for="seedWordsSaved">I have saved my seed words in a secure location</label>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="btn secondary-btn" id="backStepBtn">Back</button>
                        <button class="btn primary-btn" id="nextStep2Btn">Next</button>
                    </div>
                </div>
            </div>
            
            <div class="wallet-setup-step" id="step3">
                <div class="wallet-setup-form">
                    <div class="form-group">
                        <label for="walletPassword">Password</label>
                        <input type="password" id="walletPassword" placeholder="Set a strong password">
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm your password">
                    </div>
                    <div class="actions">
                        <button class="btn secondary-btn" id="backStep2Btn">Back</button>
                        <button class="btn primary-btn" id="createWalletBtn">Create Wallet</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners for step 1
        document.getElementById('cancelSetupBtn').addEventListener('click', function() {
            walletModal.style.display = 'none';
        });
        
        document.getElementById('importSeedCheckbox').addEventListener('change', function() {
            const importSeed = this.checked;
            const seedWordsSection = document.getElementById('seedWordsSection');
            const generateKeysSection = document.getElementById('generateKeysSection');
            
            if (importSeed) {
                seedWordsSection.style.display = 'block';
                generateKeysSection.style.display = 'none';
            } else {
                seedWordsSection.style.display = 'none';
                generateKeysSection.style.display = 'block';
            }
        });
        
        document.getElementById('nextStepBtn').addEventListener('click', function() {
            const accountName = document.getElementById('accountName').value;
            if (!accountName) {
                alert('Please enter an account name');
                return;
            }
            
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            
            // Check if importing seed words
            const importSeed = document.getElementById('importSeedCheckbox').checked;
            if (importSeed) {
                document.getElementById('seedWordsSection').style.display = 'block';
                document.getElementById('generateKeysSection').style.display = 'none';
            } else {
                // Generate seed words for new wallet creation
                document.getElementById('generateKeysSection').style.display = 'block';
                generateSeedWords();
            }
        });
        
        // Add event listeners for step 2
        document.getElementById('backStepBtn').addEventListener('click', function() {
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step1').classList.add('active');
        });
        
        document.getElementById('nextStep2Btn').addEventListener('click', function() {
            const importSeed = document.getElementById('importSeedCheckbox') ? document.getElementById('importSeedCheckbox').checked : false;
            
            if (importSeed) {
                const seedWords = document.getElementById('seedWords').value.trim();
                if (!seedWords) {
                    alert('Please enter your seed words');
                    return;
                }
            } else {
                const seedWordsSaved = document.getElementById('seedWordsSaved').checked;
                if (!seedWordsSaved) {
                    alert('Please confirm that you have saved your seed words');
                    return;
                }
            }
            
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');
        });
        
        // Add event listeners for step 3
        document.getElementById('backStep2Btn').addEventListener('click', function() {
            document.getElementById('step3').classList.remove('active');
            document.getElementById('step2').classList.add('active');
        });
        
        document.getElementById('createWalletBtn').addEventListener('click', async function() {
            const password = document.getElementById('walletPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!password || !confirmPassword) {
                alert('Please enter and confirm your password');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if (password.length < 8) {
                alert('Password must be at least 8 characters long');
                return;
            }
            
            // Check if we're restoring a wallet
            const importSeed = document.getElementById('importSeedCheckbox') ? document.getElementById('importSeedCheckbox').checked : false;
            const buttonText = this.textContent;
            
            // Update button text based on flow
            if (importSeed) {
                this.textContent = 'Restore Wallet';
            } else {
                this.textContent = 'Create Wallet';
            }
            
            // Create wallet
            await createWallet(password);
        });
    }
    
    function setupRestoreWalletFormListeners() {
        // Add event listeners for step 1
        document.getElementById('cancelSetupBtn').addEventListener('click', function() {
            walletModal.style.display = 'none';
        });
        
        document.getElementById('nextStepBtn').addEventListener('click', function() {
            const accountName = document.getElementById('accountName').value;
            if (!accountName) {
                alert('Please enter an account name');
                return;
            }
            
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
        });
        
        // Add event listeners for step 2
        document.getElementById('backStepBtn').addEventListener('click', function() {
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step1').classList.add('active');
        });
        
        document.getElementById('nextStep2Btn').addEventListener('click', function() {
            const seedWords = document.getElementById('seedWords').value.trim();
            if (!seedWords) {
                alert('Please enter your seed words');
                return;
            }
            
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');
        });
        
        // Add event listeners for step 3
        document.getElementById('backStep2Btn').addEventListener('click', function() {
            document.getElementById('step3').classList.remove('active');
            document.getElementById('step2').classList.add('active');
        });
        
        document.getElementById('createWalletBtn').addEventListener('click', async function() {
            const password = document.getElementById('walletPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!password || !confirmPassword) {
                alert('Please enter and confirm your password');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if (password.length < 8) {
                alert('Password must be at least 8 characters long');
                return;
            }
            
            // Update button text for restore flow
            this.textContent = 'Restore Wallet';
            
            // Restore wallet (in a real implementation, you would use the seed words)
            await createWallet(password);
        });
    }
    
    function generateSeedWords() {
        // Generate more random seed words
        const wordList = [
            'circuit', 'digital', 'neon', 'pulse', 'quantum', 'matrix',
            'cyber', 'grid', 'node', 'packet', 'signal', 'voltage',
            'firewall', 'protocol', 'server', 'client', 'router', 'switch',
            'algorithm', 'binary', 'cache', 'daemon', 'entropy', 'firmware'
        ];
        
        // Shuffle the words and take first 12
        const shuffledWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 12);
        
        const seedWordsContainer = document.getElementById('generatedSeedWords');
        seedWordsContainer.innerHTML = '';
        
        shuffledWords.forEach((word, index) => {
            const wordElement = document.createElement('div');
            wordElement.className = 'seed-word';
            wordElement.textContent = `${index + 1}. ${word}`;
            seedWordsContainer.appendChild(wordElement);
        });
    }
    
    async function createWallet(password) {
        try {
            // Create a new wallet using the WASM library
            const walletResult = await window.wallet.createWallet(password);
            const publicKey = walletResult.publicKey;
            const walletDataJson = walletResult.walletData;
            
            // Create wallet data object
            const walletData = {
                publicKey: publicKey,
                accountName: document.getElementById('accountName').value,
                createdAt: new Date().toISOString(),
                walletData: walletDataJson
            };
            
            // Add additional wallet information if available
            // These would require updates to the WASM wallet implementation
            /*
            if (window.wallet.getMnemonic) {
                walletData.mnemonic = window.wallet.getMnemonic();
            }
            if (window.wallet.getAddress) {
                walletData.address = window.wallet.getAddress();
            }
            if (window.wallet.getSpendingKey) {
                walletData.spendingKey = window.wallet.getSpendingKey();
            }
            if (window.wallet.getViewingKey) {
                walletData.viewingKey = window.wallet.getViewingKey();
            }
            if (window.wallet.getStealthAddress) {
                walletData.stealthAddress = window.wallet.getStealthAddress();
            }
            */
            
            // Save wallet data
            if (saveWalletData(walletData)) {
                updateWalletUI(publicKey, '0 ASC'); // Start with 0 balance instead of fake value
                
                // Close modal safely
                if (walletModal) {
                    walletModal.style.display = 'none';
                }
                
                // Show success message
                alert('Wallet created successfully!');
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Failed to save wallet data');
            }
        } catch (error) {
            console.error('Error creating wallet:', error);
            alert('Failed to create wallet: ' + error.message);
        }
    }

    // Chat functionality
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    if (sendMessageBtn && messageInput) {
        sendMessageBtn.addEventListener('click', function() {
            // Add visual feedback
            this.style.animation = 'button-click 0.3s';
            
            const message = messageInput.value.trim();
            if (message) {
                addMessage('User', message, true);
                messageInput.value = '';
                
                // Simulate response
                setTimeout(() => {
                    const responses = [
                        "Welcome to CNetAI!",
                        "Thanks for your message!",
                        "The future of blockchain is here!",
                        "Stay secure with our quantum-resistant tech!",
                        "Have you checked out our privacy features?",
                        "Join our community to earn ASC and Battle Chips!",
                        "Our AI Oracles are constantly scanning for threats!",
                        "Download the dApp to start mining threat signatures!"
                    ];
                    const response = responses[Math.floor(Math.random() * responses.length)];
                    addMessage('CNetAI Bot', response, false);
                }, 1000);
            }
        });
        
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessageBtn.click();
            }
        });
    }
    
    function addMessage(username, content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : ''}`;
        
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="username">${username}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${content}</div>
        `;
        
        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Animate in
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
    }

    // Swap functionality
    const fromAmount = document.getElementById('fromAmount');
    const toAmount = document.getElementById('toAmount');
    const fromToken = document.getElementById('fromToken');
    const toToken = document.getElementById('toToken');
    const swapBtn = document.getElementById('swapBtn');
    
    if (fromAmount && toAmount) {
        // Simple rate conversion (for demo purposes)
        function updateSwapRate() {
            const amount = parseFloat(fromAmount.value) || 0;
            let rate = 0.0001; // 1 ASC = 0.0001 ETH
            
            if (fromToken.value === 'cnetai' && toToken.value === 'eth') {
                rate = 0.0001;
            } else if (fromToken.value === 'eth' && toToken.value === 'cnetai') {
                rate = 10000; // 1 ETH = 10,000 ASC
            } else if (fromToken.value === 'usdt' && toToken.value === 'cnetai') {
                rate = 10; // 1 USDT = 10 ASC
            } else if (fromToken.value === 'cnetai' && toToken.value === 'usdt') {
                rate = 0.1; // 1 ASC = 0.1 USDT
            }
            
            toAmount.value = (amount * rate).toFixed(6);
        }
        
        fromAmount.addEventListener('input', updateSwapRate);
        fromToken.addEventListener('change', updateSwapRate);
        toToken.addEventListener('change', updateSwapRate);
        
        if (swapBtn) {
            swapBtn.addEventListener('click', function() {
                // Add visual feedback
                this.style.animation = 'button-click 0.3s';
                
                if (fromAmount.value && parseFloat(fromAmount.value) > 0) {
                    // Show swap animation
                    const swapGraphic = document.querySelector('.token-flow');
                    if (swapGraphic) {
                        swapGraphic.style.animation = 'swap-animation 1s';
                    }
                    
                    // Add cyber effect to tokens
                    const fromTokenEl = document.querySelector('.from-token');
                    const toTokenEl = document.querySelector('.to-token');
                    
                    if (fromTokenEl && toTokenEl) {
                        fromTokenEl.style.animation = 'token-swap-pulse 1s';
                        toTokenEl.style.animation = 'token-swap-pulse 1s';
                    }
                    
                    setTimeout(() => {
                        alert(`Swap initiated: ${fromAmount.value} ${fromToken.value.toUpperCase()} for ${toAmount.value} ${toToken.value.toUpperCase()}`);
                        // In a real implementation, this would connect to a DEX
                    }, 1000);
                } else {
                    alert('Please enter a valid amount');
                }
            });
        }
    }

    // Auction functionality
    const bidBtn = document.getElementById('bidBtn');
    const claimBtn = document.getElementById('claimBtn');
    const bidAmount = document.getElementById('bidAmount');
    const currentPrice = document.getElementById('currentPrice');
    const timeRemaining = document.getElementById('timeRemaining');
    
    if (bidBtn) {
        bidBtn.addEventListener('click', function() {
            // Add visual feedback
            this.style.animation = 'button-click 0.3s';
            
            if (bidAmount.value && parseFloat(bidAmount.value) > 0) {
                // Animate the price chart
                const priceLine = document.querySelector('.price-line');
                if (priceLine) {
                    priceLine.style.animation = 'bid-animation 1s';
                }
                
                // Add cyber effect to bid button
                this.style.boxShadow = '0 0 30px rgba(255, 102, 0, 0.8)';
                
                setTimeout(() => {
                    alert(`Bid placed: ${bidAmount.value} ETH`);
                    // In a real implementation, this would interact with the auction contract
                    this.style.boxShadow = '0 0 20px rgba(255, 102, 0, 0.4)';
                }, 1000);
            } else {
                alert('Please enter a valid bid amount');
            }
        });
    }
    
    if (claimBtn) {
        claimBtn.addEventListener('click', function() {
            // Add visual feedback
            this.style.animation = 'button-click 0.3s';
            
            // Animate the claim button
            this.style.background = 'linear-gradient(90deg, var(--accent-green), var(--accent-cyan))';
            this.style.boxShadow = '0 0 30px rgba(0, 255, 102, 0.8)';
            
            setTimeout(() => {
                alert('Tokens claimed successfully!');
                // In a real implementation, this would interact with the auction contract
                this.style.background = 'linear-gradient(90deg, var(--secondary-blue), var(--accent-cyan))';
                this.style.boxShadow = '0 0 15px rgba(0, 204, 255, 0.4)';
            }, 1000);
        });
    }
    
    // Simulate auction timer
    if (timeRemaining) {
        setInterval(() => {
            // This is just a simulation - in reality, this would come from the blockchain
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const diff = tomorrow - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            timeRemaining.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Particle background effect
    createParticleBackground();
    
    // Create scanlines effect
    createScanlines();
    
    // Create digital rain effect
    createDigitalRain();
    
    // Create cyber grid overlay
    createCyberGrid();
    
    // Initialize service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./sw.js')
                .then(function(registration) {
                    console.log('SW registered: ', registration);
                })
                .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
    
    // Add typing effect to hero subtitle
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const originalText = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        typeText(heroSubtitle, originalText, 0, 30);
    }
    
    // Add glitch effect to hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        setInterval(() => {
            heroTitle.style.textShadow = `
                0 0 10px var(--accent-cyan),
                0 0 20px var(--accent-cyan),
                0 0 30px var(--accent-cyan),
                -2px 0 var(--accent-orange),
                2px 0 var(--accent-purple)
            `;
            
            setTimeout(() => {
                heroTitle.style.textShadow = '0 0 20px rgba(0, 204, 255, 0.5)';
            }, 200);
        }, 5000);
    }
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Create animated particle background
function createParticleBackground() {
    // Create particles
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    
    // Create new particles periodically
    setInterval(createParticle, 1000);
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 5 + 1;
    const posX = Math.random() * window.innerWidth;
    const posY = Math.random() * window.innerHeight;
    const tx = (Math.random() - 0.5) * window.innerWidth;
    const ty = (Math.random() - 0.5) * window.innerHeight;
    const hue = Math.floor(Math.random() * 360);
    
    // Set styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}px`;
    particle.style.top = `${posY}px`;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.background = `hsl(${hue}, 100%, 70%)`;
    particle.style.boxShadow = `0 0 ${size * 2}px hsl(${hue}, 100%, 50%)`;
    
    document.body.appendChild(particle);
    
    // Remove particle after animation completes
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 15000);
}

function createScanlines() {
    const scanlines = document.createElement('div');
    scanlines.className = 'scanlines';
    document.body.appendChild(scanlines);
}

function createDigitalRain() {
    const digitalRain = document.createElement('div');
    digitalRain.className = 'digital-rain';
    
    // Create columns
    const columnCount = Math.floor(window.innerWidth / 20);
    for (let i = 0; i < columnCount; i++) {
        const column = document.createElement('div');
        column.className = 'rain-column';
        column.style.left = `${i * 20}px`;
        column.style.animationDuration = `${Math.random() * 5 + 5}s`;
        column.style.animationDelay = `${Math.random() * 5}s`;
        
        // Generate random characters
        let chars = '';
        const charCount = Math.floor(Math.random() * 20) + 10;
        for (let j = 0; j < charCount; j++) {
            chars += String.fromCharCode(Math.floor(Math.random() * 94) + 33);
        }
        column.textContent = chars;
        
        digitalRain.appendChild(column);
    }
    
    document.body.appendChild(digitalRain);
}

function createCyberGrid() {
    const cyberGrid = document.createElement('div');
    cyberGrid.className = 'cyber-grid';
    document.body.appendChild(cyberGrid);
}

// Typing effect for hero subtitle
function typeText(element, text, index, delay) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        setTimeout(() => typeText(element, text, index + 1, delay), delay);
    }
}

// Add intersection observer for fade-in animations
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                // Add specific animations based on element type
                if (entry.target.classList.contains('feature-card')) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                } else if (entry.target.classList.contains('section-title')) {
                    entry.target.style.animation = 'fadeIn 0.8s ease-out forwards';
                } else if (entry.target.classList.contains('pillar-card')) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                } else if (entry.target.classList.contains('privacy-feature')) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                } else if (entry.target.classList.contains('developer-feature')) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        observer.observe(title);
    });
    
    // Observe vision pillars
    const pillarCards = document.querySelectorAll('.pillar-card');
    pillarCards.forEach(card => {
        observer.observe(card);
    });
    
    // Observe privacy features
    const privacyFeatures = document.querySelectorAll('.privacy-feature');
    privacyFeatures.forEach(feature => {
        observer.observe(feature);
    });
    
    // Observe developer features
    const developerFeatures = document.querySelectorAll('.developer-feature');
    developerFeatures.forEach(feature => {
        observer.observe(feature);
    });
});

// Add custom CSS animations
function addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .feature-details li {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .feature-details li:nth-child(1) { animation-delay: 0.1s; }
        .feature-details li:nth-child(2) { animation-delay: 0.2s; }
        .feature-details li:nth-child(3) { animation-delay: 0.3s; }
        .feature-details li:nth-child(4) { animation-delay: 0.4s; }
        
        .battle-chips-info li {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .battle-chips-info li:nth-child(1) { animation-delay: 0.1s; }
        .battle-chips-info li:nth-child(2) { animation-delay: 0.2s; }
    `;
    document.head.appendChild(style);
}

// Initialize custom animations
document.addEventListener('DOMContentLoaded', addCustomAnimations);

// Add advanced visual effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to all interactive elements
    const interactiveElements = document.querySelectorAll(
        '.feature-card, .pillar-card, .privacy-feature, .developer-feature, .roadmap-phase'
    );
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click effects to all buttons
    const allButtons = document.querySelectorAll('.btn');
    allButtons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// Tokenomics chart interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to chart segments
    const chartSegments = document.querySelectorAll('.chart-segment');
    const legendItems = document.querySelectorAll('.legend-item');
    
    // Create animated particles for the chart
    startChartParticles();
    
    chartSegments.forEach((segment, index) => {
        segment.addEventListener('mouseenter', function() {
            const label = this.getAttribute('data-label');
            const value = this.getAttribute('data-value');
            
            // Highlight corresponding legend item
            legendItems.forEach(item => {
                if (item.querySelector('.legend-text').textContent === label) {
                    item.style.background = 'rgba(0, 102, 204, 0.4)';
                    item.style.transform = 'translateY(-2px)';
                    item.style.boxShadow = '0 5px 15px rgba(0, 204, 255, 0.3)';
                    item.style.animation = 'legend-glow 1s infinite';
                }
            });
            
            // Add glow effect to center
            const chartCenter = document.querySelector('.chart-center');
            if (chartCenter) {
                chartCenter.style.boxShadow = '0 0 30px rgba(0, 204, 255, 0.8)';
            }
            
            // Add pulse animation to segment
            this.style.animation = 'segment-pulse 1s infinite';
        });
        
        segment.addEventListener('mouseleave', function() {
            // Reset legend items
            legendItems.forEach(item => {
                item.style.background = 'rgba(0, 51, 102, 0.2)';
                item.style.transform = 'translateY(0)';
                item.style.boxShadow = 'none';
                item.style.animation = '';
            });
            
            // Reset center glow
            const chartCenter = document.querySelector('.chart-center');
            if (chartCenter) {
                chartCenter.style.boxShadow = '0 0 20px rgba(0, 204, 255, 0.5)';
            }
            
            // Remove pulse animation
            this.style.animation = '';
        });
        
        // Add click effect to segments
        segment.addEventListener('click', function() {
            const label = this.getAttribute('data-label');
            const value = this.getAttribute('data-value');
            
            // Highlight segment
            this.style.transform = `rotate(${this.style.getPropertyValue('--rotation')}) skewY(calc(90deg - (${this.style.getPropertyValue('--percentage')} * 3.6deg))) scale(1.2)`;
            this.style.boxShadow = `0 0 50px ${this.style.getPropertyValue('--color')}`;
            this.style.zIndex = '10';
            
            // Highlight corresponding legend item
            legendItems.forEach(item => {
                if (item.querySelector('.legend-text').textContent === label) {
                    item.style.background = 'rgba(0, 204, 255, 0.6)';
                    item.style.transform = 'translateY(-3px) scale(1.05)';
                    item.style.boxShadow = '0 8px 20px rgba(0, 204, 255, 0.6)';
                }
            });
            
            // Reset after delay
            setTimeout(() => {
                this.style.transform = `rotate(${this.style.getPropertyValue('--rotation')}) skewY(calc(90deg - (${this.style.getPropertyValue('--percentage')} * 3.6deg)))`;
                this.style.boxShadow = `inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 30px ${this.style.getPropertyValue('--color')}`;
                this.style.zIndex = '5';
                
                // Reset legend items after delay
                setTimeout(() => {
                    legendItems.forEach(item => {
                        item.style.background = 'rgba(0, 51, 102, 0.2)';
                        item.style.transform = 'translateY(0) scale(1)';
                        item.style.boxShadow = 'none';
                    });
                }, 300);
            }, 1000);
        });
    });
    
    // Add click effects to legend items
    legendItems.forEach(item => {
        item.addEventListener('click', function() {
            const label = this.getAttribute('data-label');
            
            // Find corresponding chart segment
            chartSegments.forEach(segment => {
                if (segment.getAttribute('data-label') === label) {
                    // Add visual feedback
                    segment.style.transform = `rotate(${segment.style.getPropertyValue('--rotation')}) skewY(calc(90deg - (${segment.style.getPropertyValue('--percentage')} * 3.6deg))) scale(1.2)`;
                    segment.style.boxShadow = `0 0 50px ${segment.style.getPropertyValue('--color')}`;
                    segment.style.opacity = '1';
                    segment.style.zIndex = '10';
                    segment.style.animation = 'segment-pulse 0.5s';
                    
                    // Highlight legend item
                    this.style.background = 'rgba(0, 204, 255, 0.6)';
                    this.style.transform = 'translateY(-3px) scale(1.05)';
                    this.style.boxShadow = '0 8px 20px rgba(0, 204, 255, 0.6)';
                    this.style.animation = 'legend-glow 1s infinite';
                    
                    // Reset after delay
                    setTimeout(() => {
                        segment.style.transform = `rotate(${segment.style.getPropertyValue('--rotation')}) skewY(calc(90deg - (${segment.style.getPropertyValue('--percentage')} * 3.6deg)))`;
                        segment.style.boxShadow = `inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 30px ${segment.style.getPropertyValue('--color')}`;
                        segment.style.zIndex = '5';
                        segment.style.animation = '';
                        
                        // Reset legend item after a longer delay
                        setTimeout(() => {
                            this.style.background = 'rgba(0, 51, 102, 0.2)';
                            this.style.transform = 'translateY(0) scale(1)';
                            this.style.boxShadow = 'none';
                            this.style.animation = '';
                        }, 500);
                    }, 1000);
                }
            });
        });
        
        // Add hover effects to legend items
        item.addEventListener('mouseenter', function() {
            const label = this.getAttribute('data-label');
            
            // Highlight corresponding chart segment
            chartSegments.forEach(segment => {
                if (segment.getAttribute('data-label') === label) {
                    segment.style.transform = `rotate(${segment.style.getPropertyValue('--rotation')}) skewY(calc(90deg - (${segment.style.getPropertyValue('--percentage')} * 3.6deg))) scale(1.05)`;
                    segment.style.boxShadow = `inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 30px ${segment.style.getPropertyValue('--color')}`;
                    segment.style.opacity = '1';
                    segment.style.zIndex = '5';
                    segment.style.animation = 'segment-pulse 1s infinite';
                }
            });
            
            // Add glow effect
            this.style.animation = 'legend-glow 1s infinite';
        });
        
        item.addEventListener('mouseleave', function() {
            const label = this.getAttribute('data-label');
            
            // Reset chart segment
            chartSegments.forEach(segment => {
                if (segment.getAttribute('data-label') === label) {
                    segment.style.transform = `rotate(${segment.style.getPropertyValue('--rotation')}) skewY(calc(90deg - (${segment.style.getPropertyValue('--percentage')} * 3.6deg)))`;
                    segment.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.5)';
                    segment.style.opacity = '0.9';
                    segment.style.zIndex = '1';
                    segment.style.animation = '';
                }
            });
            
            // Remove glow effect
            this.style.animation = '';
        });
    });
    
    // Add animation to chart center
    const chartCenter = document.querySelector('.chart-center');
    if (chartCenter) {
        setInterval(() => {
            chartCenter.style.boxShadow = '0 0 40px rgba(0, 204, 255, 0.9)';
            chartCenter.style.transform = 'translate(-50%, -50%) scale(1.1)';
            setTimeout(() => {
                chartCenter.style.boxShadow = '0 0 20px rgba(0, 204, 255, 0.5)';
                chartCenter.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 500);
        }, 4000);
    }
    
    // Add click effect to chart center
    if (chartCenter) {
        chartCenter.addEventListener('click', function() {
            // Add pulse effect
            this.style.animation = 'center-pulse 0.5s';
            
            // Highlight all segments briefly
            chartSegments.forEach(segment => {
                segment.style.boxShadow = `inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 40px ${segment.style.getPropertyValue('--color')}`;
                segment.style.opacity = '1';
                segment.style.animation = 'segment-pulse 0.5s';
            });
            
            // Highlight all legend items
            legendItems.forEach(item => {
                item.style.background = 'rgba(0, 204, 255, 0.4)';
                item.style.transform = 'translateY(-2px)';
                item.style.boxShadow = '0 5px 15px rgba(0, 204, 255, 0.3)';
                item.style.animation = 'legend-glow 0.5s';
            });
            
            // Create a burst of particles
            createParticleBurst();
            
            // Reset after delay
            setTimeout(() => {
                chartSegments.forEach(segment => {
                    segment.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.5)';
                    segment.style.opacity = '0.9';
                    segment.style.animation = '';
                });
                
                legendItems.forEach(item => {
                    item.style.background = 'rgba(0, 51, 102, 0.2)';
                    item.style.transform = 'translateY(0)';
                    item.style.boxShadow = 'none';
                    item.style.animation = '';
                });
                
                this.style.animation = '';
            }, 1000);
        });
    }
});

// Create animated particles for the chart
function createChartParticles() {
    const chart = document.querySelector('.distribution-chart');
    if (!chart) {
        // Only log once per page load to avoid spam
        if (!window.chartParticleLoggingDone) {
            console.debug('Chart particles: No distribution chart found on this page');
            window.chartParticleLoggingDone = true;
        }
        return;
    }
    
    const particlesContainer = document.querySelector('.chart-particles');
    if (!particlesContainer) {
        console.debug('Chart particles: Particles container not found');
        return;
    }
    
    // Create a new particle
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position within the chart (relative to center)
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const centerX = 175; // Half of 350px chart width
    const centerY = 175; // Half of 350px chart height
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    // Random movement
    const tx = (Math.random() - 0.5) * 100;
    const ty = (Math.random() - 0.5) * 100;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    
    // Random size
    const size = 4 + Math.random() * 4; // Between 4px and 8px
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random color
    const colors = ['#00aaff', '#ff6600', '#00cc66', '#ffcc00', '#cc00ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.background = color;
    particle.style.boxShadow = `0 0 ${size * 1.5}px ${color}`;
    
    // Random animation duration
    particle.style.animationDuration = `${3 + Math.random() * 4}s`;
    particle.style.animationDelay = `${Math.random() * 2}s`;
    
    particlesContainer.appendChild(particle);
    
    // Remove particle after animation completes
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 7000);
}

// Continuously generate chart particles
function startChartParticles() {
    // Check if we're on a page with a chart
    const chart = document.querySelector('.distribution-chart');
    if (!chart) {
        // Only log once per page load to avoid spam
        if (!window.chartStartLoggingDone) {
            console.debug('Chart particles: No chart found on this page, skipping');
            window.chartStartLoggingDone = true;
        }
        return;
    }
    
    console.debug('Starting chart particles');
    
    // Create initial batch of particles
    for (let i = 0; i < 30; i++) {
        setTimeout(() => createChartParticles(), i * 200);
    }
    
    // Continue creating particles periodically
    setInterval(createChartParticles, 300);
}

// Create a burst of particles when clicking the center
function createParticleBurst() {
    const chart = document.querySelector('.distribution-chart');
    if (!chart) return;
    
    const particlesContainer = document.querySelector('.chart-particles');
    if (!particlesContainer) return;
    
    // Create 20 particles for burst effect
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Start from center
        particle.style.left = '175px';
        particle.style.top = '175px';
        
        // Random movement outward
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 150;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        // Random size
        const size = 4 + Math.random() * 6; // Between 4px and 10px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random color
        const colors = ['#00aaff', '#ff6600', '#00cc66', '#ffcc00', '#cc00ff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
        
        // Short animation for burst effect
        particle.style.animationDuration = `${1 + Math.random() * 1}s`;
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
}

// Add custom animations for tokenomics
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes center-pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.2); box-shadow: 0 0 50px rgba(0, 204, 255, 1); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes chart-segment-glow {
            0% { box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5); }
            50% { box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 40px var(--color); }
            100% { box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5); }
        }
        
        @keyframes segment-pulse {
            0% { transform: rotate(var(--rotation)) skewY(calc(90deg - (var(--percentage) * 3.6deg))) scale(1); }
            50% { transform: rotate(var(--rotation)) skewY(calc(90deg - (var(--percentage) * 3.6deg))) scale(1.05); }
            100% { transform: rotate(var(--rotation)) skewY(calc(90deg - (var(--percentage) * 3.6deg))) scale(1); }
        }
        
        @keyframes legend-glow {
            0% { box-shadow: 0 0 5px rgba(0, 204, 255, 0.3); }
            50% { box-shadow: 0 0 15px rgba(0, 204, 255, 0.6); }
            100% { box-shadow: 0 0 5px rgba(0, 204, 255, 0.3); }
        }
        

    `;
    document.head.appendChild(style);
});