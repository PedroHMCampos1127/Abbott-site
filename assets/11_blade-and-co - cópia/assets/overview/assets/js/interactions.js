// ========== NAVIGATION SCROLL ==========
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 80) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
});

// ========== MOBILE NAVIGATION ==========
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
});

function closeMobileNav() {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
    document.body.style.overflow = '';
}

// ========== SCROLL REVEAL ==========
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ========== TESTIMONIAL SLIDER ==========
const testimonialItems = document.querySelectorAll('.testimonial-item');
const testimonialDots = document.querySelectorAll('.testimonial-dot');
let currentTestimonial = 0;
let testimonialInterval;

function showTestimonial(index) {
    testimonialItems.forEach(item => item.classList.remove('active'));
    testimonialDots.forEach(dot => dot.classList.remove('active'));
    testimonialItems[index].classList.add('active');
    testimonialDots[index].classList.add('active');
    currentTestimonial = index;
}

testimonialDots.forEach(dot => {
    dot.addEventListener('click', () => {
        showTestimonial(parseInt(dot.dataset.index));
        clearInterval(testimonialInterval);
        startTestimonialAutoplay();
    });
});

function startTestimonialAutoplay() {
    testimonialInterval = setInterval(() => {
        showTestimonial((currentTestimonial + 1) % testimonialItems.length);
    }, 5000);
}

// Initialize: show first testimonial
if (testimonialItems.length > 0) {
    showTestimonial(0);
    startTestimonialAutoplay();
}

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========== PARALLAX ON HERO IMAGE ==========
const heroImg = document.querySelector('.hero-image img');
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (heroImg && scrolled < window.innerHeight) {
        heroImg.style.transform = `scale(1.05) translateY(${scrolled * 0.15}px)`;
    }
});

// ========== COUNTER ANIMATION ==========
const statNumbers = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const text = el.textContent;
            const match = text.match(/(\d+)/);
            if (match) {
                const target = parseInt(match[0]);
                const suffix = text.replace(match[0], '');
                let current = 0;
                const increment = target / 60;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = Math.floor(current) + suffix;
                }, 25);
            }
            statsObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(el => statsObserver.observe(el));
