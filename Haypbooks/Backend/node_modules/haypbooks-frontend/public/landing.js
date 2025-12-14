document.addEventListener('DOMContentLoaded', () => {
    const chaosWorld = document.getElementById('chaosWorld');
    const portal = document.getElementById('portal');
    const clarityWorld = document.getElementById('clarityWorld');
    const enterBtn = document.getElementById('enterBtn');

    // 1. Generate chaos (boring spreadsheets flying around)
    const numSheets = 35;
    for (let i = 0; i < numSheets; i++) {
        const sheet = document.createElement('div');
        sheet.classList.add('sheet');

        // Randomize size and position
        const width = Math.random() * 120 + 60;
        const height = Math.random() * 80 + 40;
        sheet.style.width = `${width}px`;
        sheet.style.height = `${height}px`;
        sheet.style.left = `${Math.random() * 100}vw`;
        sheet.style.top = `${Math.random() * 100}vh`;
        sheet.style.transform = `rotate(${Math.random() * 50 - 25}deg)`;

        chaosWorld.appendChild(sheet);
    }

    // 2. The commercial sequence timeline
    setTimeout(() => {
        runCommercialSequence();
    }, 1500);

    function runCommercialSequence() {
        const sheets = document.querySelectorAll('.sheet');

        // Phase 1: The Great Suck - all spreadsheets get pulled into portal
        sheets.forEach((sheet, index) => {
            sheet.style.animation = `suckIntoPortal 1.6s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards ${index * 0.025}s`;
        });

        // Phase 2: Portal explosion (after sheets are consumed)
        setTimeout(() => {
            portal.style.animation = 'explodePortal 1.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
            chaosWorld.style.transition = 'background 1.2s';
            chaosWorld.style.background = 'transparent';
        }, 2000);

        // Phase 3: Reveal the new clarity world
        setTimeout(() => {
            chaosWorld.classList.add('hidden');
            clarityWorld.style.opacity = '1';
            clarityWorld.style.transition = 'opacity 0.6s ease-in';
            clarityWorld.classList.add('hero-revealed');
        }, 2800);
    }

    // 3D parallax effect on mouse move
    document.addEventListener('mousemove', (e) => {
        if (clarityWorld.style.opacity === '1') {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 60;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 60;
            const container = document.querySelector('.dashboard-3d-container');
            if (container) {
                container.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
                container.style.transition = 'transform 0.1s ease-out';
            }
        }
    });

    // Button click handler - navigate to main app
    enterBtn.addEventListener('click', () => {
        // Add exit animation
        clarityWorld.style.transition = 'opacity 0.5s, transform 0.5s';
        clarityWorld.style.opacity = '0';
        clarityWorld.style.transform = 'scale(0.95)';

        // Navigate to main app after animation
        setTimeout(() => {
            // Check if user is authenticated
            const token = localStorage.getItem('accessToken');
            if (token) {
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                // Redirect to login
                window.location.href = '/login';
            }
        }, 500);
    });

    // Optional: Skip intro with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            enterBtn.click();
        }
    });
});
