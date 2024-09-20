const portfolioItems = document.querySelectorAll('.portfolio-item');

const modal = document.getElementById('portfolioModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const closeModal = document.querySelector('.close');

document.addEventListener("DOMContentLoaded", () => {
    const textElements = document.querySelectorAll('.float-text');

    textElements.forEach(el => {
        const text = el.textContent;
        el.innerHTML = text.split('').map(letter => {
            const randomDelay = (Math.random() * 2).toFixed(2);
            if (letter === ' ') {
                return `<span>&nbsp;</span>`;
            }
            return `<span style="animation-delay: ${randomDelay}s;">${letter}</span>`;
        }).join('');
    });
});

document.querySelectorAll('.cat').forEach(cat => {
    const animation = cat.getAttribute('data-animation');
    const speed = cat.getAttribute('data-speed') || 1;

    // Set animation speed
    cat.style.setProperty('--speed', `${speed}s`);

    // Switch background image and animation keyframes based on data attribute
    switch (animation) {
        case 'idle':
            cat.style.backgroundImage = "url('Home\Images\Cat\Idle.png')";            cat.style.animationName = 'idle-animation';
            break;
        case 'walk':
            cat.style.backgroundImage = "url('Home\Images\Cat\Walk.png')";
            cat.style.animationName = 'walk-animation';
            break;
        case 'run':
            cat.style.backgroundImage = "url('Home\Images\Cat\Run.png')";
            cat.style.animationName = 'run-animation';
            break;
        case 'itch':
            cat.style.backgroundImage = "url('Home\Images\Cat\Itch.png')";
            cat.style.animationName = 'itch-animation';
            break;
        default:
            cat.style.backgroundImage = "url('Home\Images\Cat\Idle.png')";
            cat.style.animationName = 'idle-animation';
    }
});


document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -(y - centerY) / 10;
        const rotateY = (x - centerX) / 10;


        item.style.transform = `translateY(-10px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0) scale(1) rotateX(0deg) rotateY(0deg)';
    });
});

portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        modal.style.display = 'flex';
        modalTitle.textContent = item.getAttribute('data-title');
        modalDescription.textContent = item.getAttribute('data-description');
    });
});


closeModal.onclick = () => {
    modal.style.display = 'none';
}

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
