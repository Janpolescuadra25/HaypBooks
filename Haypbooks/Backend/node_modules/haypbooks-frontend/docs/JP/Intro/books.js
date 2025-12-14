document.addEventListener('DOMContentLoaded', () => {
    
    const chaosWorld = document.getElementById('chaosWorld');
    const portal = document.getElementById('portal');
    const clarityWorld = document.getElementById('clarityWorld');
    
    // 1. Generate Chaos (The boring spreadsheets)
    const numSheets = 30;
    for (let i = 0; i < numSheets; i++) {
        let sheet = document.createElement('div');
        sheet.classList.add('sheet');
        
        // Randomize size and position
        let width = Math.random() * 100 + 50;
        let height = Math.random() * 60 + 30;
        sheet.style.width = `${width}px`;
        sheet.style.height = `${height}px`;
        sheet.style.left = `${Math.random() * 100}vw`;
        sheet.style.top = `${Math.random() * 100}vh`;
        // Random slight rotation for messiness
        sheet.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;

        chaosWorld.appendChild(sheet);
    }

    // 2. The Commercial Sequence Timeline

    // Start the sequence after a brief pause so the user sees the mess
    setTimeout(() => {
        runCommercialSequence();
    }, 1500);


    function runCommercialSequence() {
        const sheets = document.querySelectorAll('.sheet');

        // Phase 1: The Great Suck
        sheets.forEach((sheet, index) => {
            // Add animation with slight delays for a rushing effect
            sheet.style.animation = `suckIntoPortal 1.5s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards ${index * 0.02}s`;
        });

        // Phase 2: The Portal Explosion (Happens after sheets are sucked in)
        setTimeout(() => {
            portal.style.animation = 'explodePortal 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
            
            // Fade out the chaos container background
            chaosWorld.style.transition = 'background 1s';
            chaosWorld.style.background = 'transparent';
        }, 1800);

        // Phase 3: The Reveal of the New World
        setTimeout(() => {
            chaosWorld.classList.add('hidden'); // Remove old layer from flow
            clarityWorld.style.opacity = '1';
            clarityWorld.style.transition = 'opacity 0.5s ease-in';
            
            // Trigger the CSS transitions for text and 3D elements
            clarityWorld.classList.add('hero-revealed');

        }, 2500);
    }

    // Optional: Slight 3D mouse movement for the final scene
    document.addEventListener('mousemove', (e) => {
        if(clarityWorld.style.opacity === '1') {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
            const container = document.querySelector('.dashboard-3d-container');
            container.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });
});