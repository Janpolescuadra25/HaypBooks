// hayp.js - Cinematic storytelling orchestration
document.addEventListener('DOMContentLoaded', () => {
  const enterBtn = document.getElementById('enterBtn');
  const skipIntro = document.getElementById('skipIntro');

  // Stages
  const stages = [
    { id: 'stage1', duration: 2200 },   // Opening hook
    { id: 'stage2', duration: 2800 },   // Problem statements
    { id: 'stage3', duration: 2800 },   // Brand reveal
    { id: 'stage4', duration: 2600 },   // Benefits
    { id: 'stage5', duration: null },   // Final CTA (stays)
  ];

  let currentStage = -1;
  let stageTimer = null;
  let introPlaying = false;
  let introEnded = false;

  // Resolve navigation target. Buttons can set `data-target` to override.
  const getTarget = () => {
    const fromBtn = (enterBtn && enterBtn.getAttribute('data-target')) || (skipIntro && skipIntro.getAttribute('data-target'));
    // Default to a local demo page when opened as a file or in static previews
    return fromBtn || './new/Flow.html' || '/dashboard';
  };

  const goToApp = () => {
    const target = getTarget();
    try {
      window.location.href = target;
    } catch (err) {
      // Failsafe for unusual environments (e.g., extensions/tests)
      console.error('Navigation failed:', err, 'target:', target);
    }
  };

  // Stage sequencing
  const showStage = (index) => {
    // Hide all stages
    stages.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (el) el.classList.remove('active');
    });

    // Show current
    if (index >= 0 && index < stages.length) {
      const el = document.getElementById(stages[index].id);
      if (el) el.classList.add('active');
      currentStage = index;

      // Auto-advance if not the last stage
      if (stages[index].duration !== null) {
        clearTimeout(stageTimer);
        stageTimer = setTimeout(() => {
          if (introPlaying) showStage(index + 1);
        }, stages[index].duration);
      } else {
        // Final stage - mark intro ended
        introEnded = true;
      }
    }
  };

  const startIntro = () => {
    if (introPlaying) return;
    introPlaying = true;
    introEnded = false;
    currentStage = -1;
    document.body.classList.add('intro-play');
    // Start with stage 0 after brief delay
    setTimeout(() => showStage(0), 300);
  };

  const endIntro = () => {
    if (!introPlaying && introEnded) return;
    introPlaying = false;
    introEnded = true;
    clearTimeout(stageTimer);
    document.body.classList.remove('intro-play');
    document.body.classList.add('intro-ended');
    
    // Jump to final stage (CTA)
    showStage(stages.length - 1);
  };

  // Click handlers
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      if (introPlaying && !introEnded) {
        e.preventDefault();
        endIntro();
        return;
      }
      // Navigate if intro ended
      if (introEnded) {
        goToApp();
      }
    });

    // Keyboard support on button
    enterBtn.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space') {
        if (introPlaying && !introEnded) {
          e.preventDefault();
          endIntro();
        } else if (introEnded) {
          goToApp();
        }
      }
    });
  }

  if (skipIntro) {
    skipIntro.addEventListener('click', (e) => {
      if (introPlaying && !introEnded) {
        e.preventDefault();
        endIntro();
        return;
      }
      if (introEnded) goToApp();
    });
  }

  // Global keyboard support (Enter, Space, Escape)
  document.addEventListener('keydown', (e) => {
    const key = e.key || e.code;
    
    if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Space') {
      if (introPlaying && !introEnded) {
        e.preventDefault();
        endIntro();
      } else if (introEnded) {
        goToApp();
      }
    }
    
    if (key === 'Escape') {
      if (introPlaying && !introEnded) {
        e.preventDefault();
        endIntro();
      } else if (introEnded) {
        goToApp();
      }
    }
  });

  // Expose helpers for debugging in browser console
  try {
    window.__hayp = {
      getTarget: getTarget,
      goToApp: goToApp,
      startIntro: () => startIntro(),
      endIntro: () => endIntro(),
      showStage: (i) => showStage(i),
      currentStage: () => currentStage,
    };
  } catch (e) {
    /* ignore */
  }

  // -------------------
  // 3D Particle System
  // -------------------
  const canvas = document.getElementById('particles3d');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };
    let animationId = null;

    // Resize canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle3D {
      constructor() {
        this.reset();
        // Random initial position for staggered start
        this.z = Math.random() * 2000;
      }

      reset() {
        this.x = (Math.random() - 0.5) * 2000;
        this.y = (Math.random() - 0.5) * 2000;
        this.z = 2000;
        
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.vz = -2 - Math.random() * 2;
        
        this.size = 1 + Math.random() * 2;
        this.color = Math.random() > 0.7 ? 'rgba(20, 184, 166' : 'rgba(255, 255, 255';
        this.brightness = 0.3 + Math.random() * 0.7;
      }

      update() {
        // Move particle
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Mouse interaction - subtle attraction
        const dx = (mouse.x - canvas.width / 2) * 0.01;
        const dy = (mouse.y - canvas.height / 2) * 0.01;
        this.x += dx;
        this.y += dy;

        // Reset when particle goes past camera
        if (this.z < -100) {
          this.reset();
        }
      }

      draw() {
        // 3D projection
        const fov = 500;
        const scale = fov / (fov + this.z);
        const x2d = this.x * scale + canvas.width / 2;
        const y2d = this.y * scale + canvas.height / 2;
        const size = this.size * scale;

        // Only draw if on screen
        if (x2d < -50 || x2d > canvas.width + 50 || y2d < -50 || y2d > canvas.height + 50) return;
        if (size < 0.1) return;

        // Calculate opacity based on depth
        const depthOpacity = Math.max(0, Math.min(1, 1 - this.z / 2000));
        const alpha = this.brightness * depthOpacity;

        // Draw particle with glow
        ctx.beginPath();
        
        // Outer glow
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3);
        gradient.addColorStop(0, `${this.color}, ${alpha})`);
        gradient.addColorStop(0.3, `${this.color}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `${this.color}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.arc(x2d, y2d, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `${this.color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    const particleCount = 150;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle3D());
    }

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (animationId) cancelAnimationFrame(animationId);
    });
  }

  // Start automatically when page loads
  startIntro();
});
