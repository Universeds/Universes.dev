document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10; // Adjust tilt intensity with the divisor
        const rotateY = -(x - centerX) / 10;

        item.style.transform = `translateY(-10px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
    });
});