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
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
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
            
            // Update change percentage
            const changeElement = document.querySelector('.change');
            const changePercent = (change * 100).toFixed(2);
            changeElement.textContent = (changePercent >= 0 ? '+' : '') + changePercent + '%';
            
            if (change >= 0) {
                changeElement.className = 'change positive';
            } else {
                changeElement.className = 'change negative';
                changeElement.style.background = 'rgba(255, 0, 0, 0.2)';
                changeElement.style.color = '#ff6666';
            }
        }, 5000);
    }

    // Wallet connection functionality
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const disconnectWalletBtn = document.getElementById('disconnectWalletBtn');
    const walletAddress = document.getElementById('walletAddress');
    const tokenBalance = document.getElementById('tokenBalance');
    
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', function() {
            // Simulate wallet connection
            walletAddress.textContent = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
            tokenBalance.textContent = '1,250.50 $CNETAI';
            connectWalletBtn.textContent = 'Connected';
            connectWalletBtn.disabled = true;
        });
    }
    
    if (disconnectWalletBtn) {
        disconnectWalletBtn.addEventListener('click', function() {
            walletAddress.textContent = 'Not connected';
            tokenBalance.textContent = '0';
            connectWalletBtn.textContent = 'Connect Wallet';
            connectWalletBtn.disabled = false;
        });
    }

    // Chat functionality
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    if (sendMessageBtn && messageInput) {
        sendMessageBtn.addEventListener('click', function() {
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
                        "Have you checked out our privacy features?"
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
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="username">${username}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${content}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
            let rate = 0.0001; // 1 $CNETAI = 0.0001 ETH
            
            if (fromToken.value === 'cnetai' && toToken.value === 'eth') {
                rate = 0.0001;
            } else if (fromToken.value === 'eth' && toToken.value === 'cnetai') {
                rate = 10000; // 1 ETH = 10,000 $CNETAI
            } else if (fromToken.value === 'usdt' && toToken.value === 'cnetai') {
                rate = 10; // 1 USDT = 10 $CNETAI
            } else if (fromToken.value === 'cnetai' && toToken.value === 'usdt') {
                rate = 0.1; // 1 $CNETAI = 0.1 USDT
            }
            
            toAmount.value = (amount * rate).toFixed(6);
        }
        
        fromAmount.addEventListener('input', updateSwapRate);
        fromToken.addEventListener('change', updateSwapRate);
        toToken.addEventListener('change', updateSwapRate);
        
        if (swapBtn) {
            swapBtn.addEventListener('click', function() {
                if (fromAmount.value && parseFloat(fromAmount.value) > 0) {
                    alert(`Swap initiated: ${fromAmount.value} ${fromToken.value.toUpperCase()} for ${toAmount.value} ${toToken.value.toUpperCase()}`);
                    // In a real implementation, this would connect to a DEX
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
            if (bidAmount.value && parseFloat(bidAmount.value) > 0) {
                alert(`Bid placed: ${bidAmount.value} ETH`);
                // In a real implementation, this would interact with the auction contract
            } else {
                alert('Please enter a valid bid amount');
            }
        });
    }
    
    if (claimBtn) {
        claimBtn.addEventListener('click', function() {
            alert('Tokens claimed successfully!');
            // In a real implementation, this would interact with the auction contract
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

    // Initialize service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('SW registered: ', registration);
                })
                .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
});

// Create animated particle background
function createParticleBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 100;
    
    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 255, ${Math.random() * 0.5 + 0.1})`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Create particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Animation loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        requestAnimationFrame(animateParticles);
    }
    
    initParticles();
    animateParticles();
}

// Glitch text effect for hero title
function initGlitchText() {
    const glitchTexts = document.querySelectorAll('.glitch-text');
    
    glitchTexts.forEach(text => {
        // Create glitch effect periodically
        setInterval(() => {
            text.style.textShadow = `
                0 0 5px var(--accent-cyan),
                0 0 10px var(--accent-cyan),
                0 0 20px var(--accent-cyan),
                -2px 0 var(--accent-orange),
                2px 0 var(--accent-purple)
            `;
            
            setTimeout(() => {
                text.style.textShadow = `
                    0 0 5px var(--accent-cyan),
                    0 0 10px var(--accent-cyan),
                    0 0 20px var(--accent-cyan)
                `;
            }, 200);
        }, 3000);
    });
}

// Initialize glitch effect when DOM is loaded
document.addEventListener('DOMContentLoaded', initGlitchText);

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
});