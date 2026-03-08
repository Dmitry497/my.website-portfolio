class Starfield {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
        this.starCount = 800;
        this.isActive = true;
        
        this.init();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }
    
    init() {
        this.resize();
        this.createStars();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createStars();
    }
    
    createStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.5,
                baseOpacity: Math.random() * 0.8 + 0.2,
                currentOpacity: 0,
                twinkleSpeed: Math.random() * 0.05 + 0.02,
                twinklePhase: Math.random() * Math.PI * 2,
                fadePhase: Math.random() * Math.PI * 2,
                fadeSpeed: Math.random() * 0.01 + 0.005,
                fadeAmplitude: Math.random() * 0.5 + 0.3,
                fadeEnabled: Math.random() > 0.7,
                appearSpeed: Math.random() * 0.02 + 0.01,
                isAppearing: true
            });
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const time = Date.now() * 0.001;
        
        for (let star of this.stars) {
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
            
            let fadeEffect = 1;
            if (star.fadeEnabled) {
                fadeEffect = Math.sin(time * star.fadeSpeed + star.fadePhase) * star.fadeAmplitude + (1 - star.fadeAmplitude);
                fadeEffect = Math.max(0, Math.min(1, fadeEffect));
            }
            
            if (star.isAppearing) {
                star.currentOpacity += (star.baseOpacity * twinkle * fadeEffect - star.currentOpacity) * star.appearSpeed;
                if (Math.abs(star.currentOpacity - star.baseOpacity * twinkle * fadeEffect) < 0.01) {
                    star.isAppearing = false;
                }
            } else {
                star.currentOpacity = star.baseOpacity * twinkle * fadeEffect;
            }
            
            if (star.currentOpacity > 0.01) {
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(255, 255, 255, ' + star.currentOpacity + ')';
                this.ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                if (star.size > 1.2 && star.currentOpacity > 0.1) {
                    const gradient = this.ctx.createRadialGradient(
                        star.x, star.y, 0,
                        star.x, star.y, star.size * 1.5
                    );
                    gradient.addColorStop(0, 'rgba(255, 255, 255, ' + (star.currentOpacity * 0.2) + ')');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    this.ctx.beginPath();
                    this.ctx.fillStyle = gradient;
                    this.ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
        
        if (Math.random() < 0.01) {
            this.createShootingStar();
        }
        
        this.drawShootingStars(time);
        
        requestAnimationFrame(() => this.animate());
    }
    
    shootingStars = [];
    
    createShootingStar() {
        const side = Math.floor(Math.random() * 4);
        let x, y, vx, vy;
        
        switch(side) {
            case 0:
                x = Math.random() * this.canvas.width;
                y = 0;
                vx = (Math.random() - 0.5) * 2;
                vy = Math.random() * 3 + 2;
                break;
            case 1:
                x = this.canvas.width;
                y = Math.random() * this.canvas.height;
                vx = -(Math.random() * 3 + 2);
                vy = (Math.random() - 0.5) * 2;
                break;
            case 2:
                x = Math.random() * this.canvas.width;
                y = this.canvas.height;
                vx = (Math.random() - 0.5) * 2;
                vy = -(Math.random() * 3 + 2);
                break;
            case 3:
                x = 0;
                y = Math.random() * this.canvas.height;
                vx = Math.random() * 3 + 2;
                vy = (Math.random() - 0.5) * 2;
                break;
        }
        
        this.shootingStars.push({
            x, y, vx, vy,
            life: 1.0,
            decay: 0.02,
            size: Math.random() * 1.5 + 0.5
        });
    }
    
    drawShootingStars(time) {
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const star = this.shootingStars[i];
            
            star.x += star.vx;
            star.y += star.vy;
            star.life -= star.decay;
            
            if (star.life > 0) {
                this.ctx.beginPath();
                this.ctx.fillStyle = 'rgba(255, 255, 255, ' + star.life + ')';
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.strokeStyle = 'rgba(255, 255, 255, ' + (star.life * 0.5) + ')';
                this.ctx.lineWidth = star.size;
                this.ctx.moveTo(star.x, star.y);
                this.ctx.lineTo(star.x - star.vx * 3, star.y - star.vy * 3);
                this.ctx.stroke();
            } else {
                this.shootingStars.splice(i, 1);
            }
        }
    }
}

class ParallaxEffect {
    constructor() {
        this.layers = document.querySelectorAll('.parallax-layer');
        this.heroSection = document.getElementById('home');
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', () => this.onScroll());
        this.onScroll();
    }
    
    onScroll() {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const heroSection = this.heroSection;
        
        const heroTop = heroSection.offsetTop;
        const heroHeight = heroSection.offsetHeight;
        const heroBottom = heroTop + heroHeight;
        
        if (scrollY >= heroTop && scrollY <= heroBottom - windowHeight / 2) {
            this.layers.forEach(layer => {
                layer.classList.add('parallax-layer--visible');
            });
            
            this.layers.forEach((layer, index) => {
                const speed = 0.1 * (index + 1);
                const yPos = -(scrollY * speed);
                layer.style.transform = 'translate3d(0, ' + yPos + 'px, 0)';
            });
        } else {
            this.layers.forEach(layer => {
                layer.classList.remove('parallax-layer--visible');
            });
        }
    }
}

// ========== ЗАЩИТА КОДА ==========
(function() {
    // 1. Запрет контекстного меню (правая кнопка мыши)
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // 2. Запрет выделения текста через мышь
    document.addEventListener('selectstart', (e) => e.preventDefault());

    // 3. Запрет горячих клавиш (F12, Ctrl+U, Ctrl+Shift+I, Ctrl+A и др.)
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        // F12
        if (key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (просмотр исходного кода)
        if (e.ctrlKey && key === 'u') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I / Cmd+Option+I
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'I') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+J (консоль)
        if (e.ctrlKey && e.shiftKey && key === 'J') {
            e.preventDefault();
            return false;
        }
        // Ctrl+A (выделить всё)
        if (e.ctrlKey && key === 'a') {
            e.preventDefault();
            return false;
        }
        // Cmd+A для Mac
        if (e.metaKey && key === 'a') {
            e.preventDefault();
            return false;
        }
    });

    // 4. Простой детектор открытой консоли (опционально)
    // (закомментировано, чтобы не раздражать пользователя)
    /*
    const checkDevTools = () => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
            alert('Обнаружены инструменты разработчика. Некоторые функции могут быть ограничены.');
        }
    };
    setInterval(checkDevTools, 1000);
    */
})();

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starCanvas');
    let starfield = null;
    
    if (canvas) {
        starfield = new Starfield(canvas);
    }
    
    const parallax = new ParallaxEffect();
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.getElementById('navList');
    const body = document.body;
    
    function toggleMenu() {
        navList.classList.toggle('nav__list--active');
        body.classList.toggle('menu-open');
        
        const icon = menuToggle.querySelector('i');
        if (navList.classList.contains('nav__list--active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    }
    
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    
    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', (e) => {
            document.querySelectorAll('.nav__link').forEach(item => {
                item.classList.remove('nav__link--active');
            });
            link.classList.add('nav__link--active');
            
            if (navList.classList.contains('nav__list--active')) {
                toggleMenu();
            }
        });
    });
    
    navList.addEventListener('click', (e) => {
        if (e.target === navList) {
            toggleMenu();
        }
    });
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        
        const sections = document.querySelectorAll('section[id]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        document.querySelectorAll('.nav__link').forEach(link => {
            link.classList.remove('nav__link--active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('nav__link--active');
            }
        });
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetId === '#home' ? 0 : targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    const heroSocials = document.querySelectorAll('.hero__social-item');
    heroSocials.forEach(icon => {
        icon.addEventListener('click', function() {
            const iconClass = this.querySelector('i').className;
            
            if (iconClass.includes('github')) {
                alert('GitHub profile link would open here');
            } else if (iconClass.includes('linkedin')) {
                alert('LinkedIn profile link would open here');
            } else if (iconClass.includes('twitter')) {
                alert('Twitter profile link would open here');
            }
        });
    });
    
    const ctaButton = document.querySelector('.button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Contact form would open here');
        });
    }
});