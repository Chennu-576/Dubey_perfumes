/**
 * DUBEY PERFUMERS — BACKGROUND AUDIO & LUXURY THRESHOLD GATE CONTROLLER
 * - Displays the "Before the smoke, a threshold" entry gate with no music on open.
 * - When the user taps "LET ME IN", enters the site and immediately starts playing audio.mp3.
 * - Reveals the luxury sound pill in the corner.
 * - Pauses automatically when navigating to any other page.
 * - Resumes seamlessly on return.
 */
(function () {
  'use strict';

  var path = window.location.pathname.toLowerCase();
  var isHome = path === '/' || path === '' || path.endsWith('/index.html') || path.endsWith('/dubey/') || path.endsWith('/dubey/index.html');

  if (!isHome) {
    var existingAudio = document.getElementById('dubeyBgAudio');
    if (existingAudio) {
      existingAudio.pause();
    }
    return;
  }

  // Setup Audio element
  var audio = document.getElementById('dubeyBgAudio');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'dubeyBgAudio';
    audio.src = '/assets/audio.mp3';
    audio.loop = true;
    audio.setAttribute('playsinline', '');
    document.body.appendChild(audio);
  }

  audio.preload = 'auto';
  audio.loop = true;
  audio.muted = false;
  audio.volume = 0.65;

  // Ensure paused on entry screen
  try {
    audio.pause();
  } catch (e) {}

  // Web Audio Context setup
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && AudioContext) {
      try {
        audioCtx = new AudioContext();
      } catch (e) {}
    }
    return audioCtx;
  }

  // Inject Audio Pill Styles
  var style = document.createElement('style');
  style.textContent = `
    .dubey-audio-pill {
      position: fixed;
      bottom: 28px;
      left: 28px; right: auto;
      z-index: 9999;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 9px 18px 9px 15px;
      border-radius: 9999px;
      background: rgba(9, 9, 11, 0.88);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(253, 201, 44, 0.45);
      color: #F5F1EA;
      font-family: 'Cinzel', 'Raleway', serif, sans-serif;
      font-size: 11px;
      letter-spacing: 0.22em;
      font-weight: 600;
      text-transform: uppercase;
      cursor: pointer;
      user-select: none;
      outline: none;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.65), 0 0 16px rgba(253, 201, 44, 0.25);
      opacity: 0;
      pointer-events: none;
    }
    .dubey-audio-pill.revealed {
      opacity: 1;
      pointer-events: auto;
    }
    .dubey-audio-pill:hover {
      border-color: #FDC92C;
      transform: translateY(-2px);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.85), 0 0 24px rgba(253, 201, 44, 0.45);
      background: rgba(14, 18, 28, 0.95);
    }
    .dubey-audio-bars {
      display: flex;
      align-items: center;
      gap: 3px;
      height: 16px;
      width: 17px;
    }
    .dubey-audio-bar {
      width: 2px;
      height: 4px;
      background: #FDC92C;
      border-radius: 2px;
      transition: height 0.2s ease, opacity 0.2s ease;
    }
    .dubey-audio-pill.playing .dubey-audio-bar:nth-child(1) {
      animation: dubeyEq1 1.2s ease-in-out infinite alternate;
    }
    .dubey-audio-pill.playing .dubey-audio-bar:nth-child(2) {
      animation: dubeyEq2 0.9s ease-in-out infinite alternate 0.2s;
    }
    .dubey-audio-pill.playing .dubey-audio-bar:nth-child(3) {
      animation: dubeyEq3 1.3s ease-in-out infinite alternate 0.1s;
    }
    .dubey-audio-pill.playing .dubey-audio-bar:nth-child(4) {
      animation: dubeyEq4 0.8s ease-in-out infinite alternate 0.3s;
    }
    .dubey-audio-pill.paused .dubey-audio-bar {
      height: 3px;
      opacity: 0.45;
    }
    .dubey-audio-label {
      color: #F5F1EA;
      transition: color 0.3s ease;
      white-space: nowrap;
    }
    .dubey-audio-pill:hover .dubey-audio-label {
      color: #FDC92C;
    }
    @keyframes dubeyEq1 { 0% { height: 4px; } 100% { height: 15px; } }
    @keyframes dubeyEq2 { 0% { height: 14px; } 100% { height: 5px; } }
    @keyframes dubeyEq3 { 0% { height: 6px; } 100% { height: 16px; } }
    @keyframes dubeyEq4 { 0% { height: 13px; } 100% { height: 4px; } }

    @media (max-width: 640px) {
      .dubey-audio-pill {
        bottom: 20px;
        left: 20px; right: auto;
        padding: 8px 14px 8px 12px;
        font-size: 10px;
      }
    }
  `;
  document.head.appendChild(style);

  // Audio pill element
  var pill = document.createElement('button');
  pill.className = 'dubey-audio-pill';
  pill.setAttribute('aria-label', 'Toggle background sound');
  pill.setAttribute('title', 'Sound: click to mute / unmute');
  pill.innerHTML = `
    <div class="dubey-audio-bars">
      <span class="dubey-audio-bar"></span>
      <span class="dubey-audio-bar"></span>
      <span class="dubey-audio-bar"></span>
      <span class="dubey-audio-bar"></span>
    </div>
    <span class="dubey-audio-label">SOUND ON</span>
  `;
  document.body.appendChild(pill);

  function updateUi(isPlaying) {
    if (isPlaying) {
      pill.classList.remove('paused');
      pill.classList.add('playing');
      pill.querySelector('.dubey-audio-label').textContent = 'SOUND ON';
    } else {
      pill.classList.remove('playing');
      pill.classList.add('paused');
      pill.querySelector('.dubey-audio-label').textContent = 'MUTED';
    }
  }

  // --- LUXURY THRESHOLD GATE LOGIC ---
  var gate = document.getElementById('gate');
  var gateBtn = document.getElementById('gateBtn');
  var entered = false;

  // Particle Canvas for Threshold Gate
  (function initGateDust() {
    var canvas = document.getElementById('gateDust');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var mx = 0.5, my = 0.5;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
    }, { passive: true });

    var particles = [];
    for (var i = 0; i < 90; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.6 + Math.random() * 2.2,
        s: 0.0004 + Math.random() * 0.0016,
        o: 0.15 + Math.random() * 0.55,
        ph: Math.random() * 6.28,
        isGold: Math.random() < 0.28
      });
    }

    var raf = 0;
    function render(time) {
      var curGate = document.getElementById('gate');
      if (!curGate || (curGate.classList.contains('hide') && curGate.style.display === 'none')) {
        cancelAnimationFrame(raf);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      var px = mx - 0.5;
      var py = my - 0.5;

      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        p.y -= p.s * (p.isGold ? 2.2 : 1);
        if (p.y < -0.03) {
          p.y = 1.03;
          p.x = Math.random();
        }
        var tw = 0.6 + 0.4 * Math.sin((time || 0) / 900 + p.ph);
        var sx = (p.x + px * 0.03 * (p.isGold ? 2 : 1)) * W;
        var sy = (p.y + py * 0.03) * H;

        ctx.globalAlpha = parseFloat((p.o * tw).toFixed(3));
        ctx.fillStyle = p.isGold ? '#E9D98C' : '#cfd8ea';
        ctx.beginPath();
        ctx.arc(sx, sy, p.r, 0, 6.283);
        ctx.fill();

        if (p.isGold) {
          ctx.globalAlpha = parseFloat((p.o * tw * 0.35).toFixed(3));
          ctx.beginPath();
          ctx.arc(sx, sy, p.r * 3.2, 0, 6.283);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    }
    raf = requestAnimationFrame(render);
  })();

  function enterSite() {
    if (entered) return;
    entered = true;

    // Unlock scrolling
    document.body.classList.remove('gate-lock');

    // Fade out gate
    if (gate) {
      gate.classList.add('hide');
      setTimeout(function () {
        gate.style.display = 'none';
      }, 950);
    }

    // Start audio playback (unmuted)
    audio.muted = false;
    audio.currentTime = 0;
    var ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }

    var playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(function () {
          updateUi(true);
        })
        .catch(function (err) {
          console.warn('Audio playback error:', err);
        });
    }

    // Reveal audio pill
    pill.classList.add('revealed');
    updateUi(true);
  }

  // Wire "LET ME IN" button
  if (gateBtn) {
    gateBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      enterSite();
    });
  }

  // Keyboard accessibility: Enter or Space on gate
  window.addEventListener('keydown', function (e) {
    if (!entered && (e.key === 'Enter' || e.key === ' ')) {
      enterSite();
    }
  });

  // Manual pill toggle
  pill.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (audio.paused || audio.muted) {
      audio.muted = false;
      var ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(function () {});
      }
      audio.play().then(function () {
        updateUi(true);
      }).catch(function () {});
    } else {
      audio.pause();
      updateUi(false);
    }
  });

  // Track playback state changes
  audio.addEventListener('play', function () {
    if (!audio.muted) {
      updateUi(true);
    }
  });
  audio.addEventListener('pause', function () {
    if (!isNavigatingAway) {
      updateUi(false);
    }
  });

  // Pause and save on navigation away
  var isNavigatingAway = false;
  function pauseAndSave() {
    isNavigatingAway = true;
    if (audio && !audio.paused) {
      sessionStorage.setItem('dubey_audio_pos', audio.currentTime.toString());
      audio.pause();
    }
  }

  window.addEventListener('beforeunload', pauseAndSave);
  window.addEventListener('pagehide', pauseAndSave);

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (link && link.href) {
      try {
        var url = new URL(link.href, window.location.href);
        var isCurrentPage = url.pathname === window.location.pathname || (url.pathname === '/' && window.location.pathname.endsWith('/index.html'));
        if (!isCurrentPage && url.origin === window.location.origin) {
          pauseAndSave();
        }
      } catch (err) {}
    }
  });

  // Handle visibility changes
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (audio && !audio.paused) {
        audio.pause();
      }
    } else if (isHome && entered && !pill.classList.contains('paused')) {
      audio.muted = false;
      audio.play().then(function () {
        updateUi(true);
      }).catch(function () {});
    }
  });
})();
