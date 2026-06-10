document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    toggle.addEventListener('click', () => {
        const visible = navLinks.style.display === 'flex';
        navLinks.style.display = visible ? 'none' : 'flex';
    });

    // smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if(target) target.scrollIntoView({ behavior: 'smooth' });
            if(window.innerWidth <= 768) navLinks.style.display = 'none';
        });
    });

    // scroll reveal
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => {
        section.classList.add('hidden');
        observer.observe(section);
    });
});
