/**
 * scene.js — Three.js 3D Background Renderer
 * PortfolioForge — Cyber-Luxury Visual Layer
 * 
 * Creates an immersive animated particle field with:
 *  - Floating node network with connecting lines
 *  - Mouse-reactive camera drift
 *  - Pulsing neon orbs
 *  - Performance-aware rendering (requestAnimationFrame + visibility)
 */

(function SceneModule() {
  'use strict';

  const CONFIG = {
    PARTICLE_COUNT:    80,
    CONNECTION_DIST:   180,
    NODE_SIZE_MIN:     0.8,
    NODE_SIZE_MAX:     2.5,
    DRIFT_SPEED:       0.00012,
    MOUSE_INFLUENCE:   0.0008,
    FOG_NEAR:          800,
    FOG_FAR:           2000,
    CAMERA_Z:          900,
    NEON_COLORS: [
      0x00d4ff,   // cyan
      0x7c3aed,   // purple
      0xa855f7,   // violet
      0x00ffcc,   // teal
      0x0099ff,   // blue
    ],
    LINE_COLOR:        0x00d4ff,
    LINE_OPACITY:      0.08,
  };

  let renderer, scene, camera;
  let particles = [], lineSegments;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let frameId, isVisible = true;
  let clock = { start: Date.now(), elapsed: () => (Date.now() - clock.start) / 1000 };

  /* ── Initialise Three.js scene ─────────────────────────────────── */
  function init() {
    if (typeof THREE === 'undefined') {
      console.warn('PortfolioForge: Three.js not loaded — scene skipped.');
      return;
    }

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.0008);

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = CONFIG.CAMERA_Z;

    buildParticles();
    buildLines();
    buildAmbientLights();

    // Event listeners
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize',    onResize,    { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Start
    animate();
  }

  /* ── Build particle nodes ───────────────────────────────────────── */
  function buildParticles() {
    const spread = { x: 1200, y: 700, z: 400 };

    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      const color = CONFIG.NEON_COLORS[Math.floor(Math.random() * CONFIG.NEON_COLORS.length)];
      const size  = randomBetween(CONFIG.NODE_SIZE_MIN, CONFIG.NODE_SIZE_MAX);

      const geo  = new THREE.SphereGeometry(size, 8, 8);
      const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(
        randomBetween(-spread.x, spread.x),
        randomBetween(-spread.y, spread.y),
        randomBetween(-spread.z, spread.z)
      );

      // Drift velocity
      mesh.userData = {
        vx:      randomBetween(-0.06, 0.06),
        vy:      randomBetween(-0.04, 0.04),
        vz:      randomBetween(-0.03, 0.03),
        phase:   Math.random() * Math.PI * 2,
        baseOpacity: randomBetween(0.3, 0.9),
        glowing: Math.random() > 0.75,
      };

      scene.add(mesh);
      particles.push(mesh);
    }
  }

  /* ── Build connecting line system ───────────────────────────────── */
  function buildLines() {
    const maxConnections = CONFIG.PARTICLE_COUNT * 4;
    const positions = new Float32Array(maxConnections * 6);
    const colors    = new Float32Array(maxConnections * 6);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setDrawRange(0, 0);

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: CONFIG.LINE_OPACITY,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    lineSegments = new THREE.LineSegments(geo, mat);
    scene.add(lineSegments);
  }

  /* ── Ambient lighting ───────────────────────────────────────────── */
  function buildAmbientLights() {
    const ambLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambLight);

    const pLight1 = new THREE.PointLight(0x00d4ff, 0.8, 800);
    pLight1.position.set(0, 200, 200);
    scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0x7c3aed, 0.6, 600);
    pLight2.position.set(-300, -100, 100);
    scene.add(pLight2);
  }

  /* ── Update connection lines each frame ─────────────────────────── */
  function updateLines() {
    const posAttr = lineSegments.geometry.getAttribute('position');
    const colAttr = lineSegments.geometry.getAttribute('color');
    const posArr  = posAttr.array;
    const colArr  = colAttr.array;
    let lineCount = 0;
    const maxLines = posArr.length / 6;

    const cColor = new THREE.Color(CONFIG.LINE_COLOR);

    for (let i = 0; i < particles.length && lineCount < maxLines; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length && lineCount < maxLines; j++) {
        const b = particles[j];
        const dist = a.position.distanceTo(b.position);

        if (dist < CONFIG.CONNECTION_DIST) {
          const strength = 1 - dist / CONFIG.CONNECTION_DIST;
          const base = lineCount * 6;

          posArr[base + 0] = a.position.x;
          posArr[base + 1] = a.position.y;
          posArr[base + 2] = a.position.z;
          posArr[base + 3] = b.position.x;
          posArr[base + 4] = b.position.y;
          posArr[base + 5] = b.position.z;

          colArr[base + 0] = cColor.r * strength;
          colArr[base + 1] = cColor.g * strength;
          colArr[base + 2] = cColor.b * strength;
          colArr[base + 3] = cColor.r * strength;
          colArr[base + 4] = cColor.g * strength;
          colArr[base + 5] = cColor.b * strength;

          lineCount++;
        }
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    lineSegments.geometry.setDrawRange(0, lineCount * 2);
  }

  /* ── Animation loop ─────────────────────────────────────────────── */
  function animate() {
    if (!isVisible) { frameId = requestAnimationFrame(animate); return; }

    frameId = requestAnimationFrame(animate);
    const t = clock.elapsed();

    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * CONFIG.MOUSE_INFLUENCE * 10;
    mouse.y += (mouse.targetY - mouse.y) * CONFIG.MOUSE_INFLUENCE * 10;

    // Camera gentle drift + mouse influence
    camera.position.x += (mouse.x * 60 - camera.position.x) * 0.01;
    camera.position.y += (-mouse.y * 40 - camera.position.y) * 0.01;
    camera.lookAt(scene.position);

    // Update particles
    const bounds = { x: 1300, y: 750, z: 450 };
    particles.forEach((p) => {
      const d = p.userData;

      // Drift
      p.position.x += d.vx;
      p.position.y += d.vy;
      p.position.z += d.vz;

      // Boundary wrap
      if (p.position.x >  bounds.x) p.position.x = -bounds.x;
      if (p.position.x < -bounds.x) p.position.x =  bounds.x;
      if (p.position.y >  bounds.y) p.position.y = -bounds.y;
      if (p.position.y < -bounds.y) p.position.y =  bounds.y;
      if (p.position.z >  bounds.z) p.position.z = -bounds.z;
      if (p.position.z < -bounds.z) p.position.z =  bounds.z;

      // Opacity pulse
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2 + d.phase);
      p.material.opacity = d.baseOpacity * pulse;

      // Glow scale
      if (d.glowing) {
        const scale = 1 + 0.3 * Math.sin(t * 2 + d.phase);
        p.scale.setScalar(scale);
      }
    });

    updateLines();
    renderer.render(scene, camera);
  }

  /* ── Event handlers ─────────────────────────────────────────────── */
  function onMouseMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth)  - 0.5;
    mouse.targetY = (e.clientY / window.innerHeight) - 0.5;
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onVisibilityChange() {
    isVisible = !document.hidden;
  }

  /* ── Helpers ────────────────────────────────────────────────────── */
  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  /* ── Public API ─────────────────────────────────────────────────── */
  window.PortfolioScene = { init };

  // Auto-init after THREE loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Slight delay to ensure Three.js is ready
    setTimeout(init, 100);
  }

})();
