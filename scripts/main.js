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