/* ===================================
   MLN111 – Main JavaScript
   Nhóm 6 | ĐH FPT HCM
   =================================== */

/* ── 0a. SCROLL TO TOP ON LOAD/REFRESH ─ */
// Prevent browser from restoring previous scroll position
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

/* ── 0b. INTRO SPLASH SCREEN ────────── */
(function () {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  // Lock body scroll while intro is showing
  document.body.style.overflow = 'hidden';

  // After animations complete (~4.3s), trigger slide-up exit
  const EXIT_DELAY = 4300; // ms

  setTimeout(() => {
    overlay.classList.add('intro-exit');

    // After exit animation finishes, fully remove from flow
    overlay.addEventListener('transitionend', () => {
      overlay.classList.add('intro-hidden');
      document.body.style.overflow = '';
    }, { once: true });
  }, EXIT_DELAY);
})();

document.addEventListener('DOMContentLoaded', () => {


  /* ── 1. SCROLL PROGRESS BAR ────────── */
  const progressBar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (scrolled / total) * 100;
    progressBar.style.width = pct + '%';
  }, { passive: true });


  /* ── 2. NAVBAR – active link + glass ── */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const updateNavbar = () => {
    // Glassmorphism on scroll
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(8,8,16,0.97)';
    } else {
      navbar.style.background = 'rgba(8,8,16,0.85)';
    }

    // Active link based on section in view
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();


  /* ── 3. REVEAL ON SCROLL (Intersection Observer) ── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ── 4. COUNTER ANIMATION ─────────── */
  const counters = document.querySelectorAll('.stat-number[data-target]');

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 1200;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));


  /* ── 5. PARTICLE CANVAS (Hero) ────── */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        // mix of red and gold particles
        const isGold = Math.random() < 0.25;
        this.color = isGold
          ? `rgba(243,156,18,${Math.random() * 0.5 + 0.1})`
          : `rgba(192,57,43,${Math.random() * 0.5 + 0.1})`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Create 110 particles
    for (let i = 0; i < 110; i++) particles.push(new Particle());

    // Draw connecting lines between nearby particles
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(192,57,43,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      animFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Pause when hero not in view (perf)
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) {
          cancelAnimationFrame(animFrameId);
        } else {
          animate();
        }
      });
    }, { threshold: 0 });
    heroObserver.observe(document.getElementById('hero'));
  }


  /* ── 6. INTERACTIVE VIDEO PLAYER ─── */
  const video = document.getElementById('scenario-video');
  const overlay = document.getElementById('video-overlay');
  const playBtn = document.getElementById('play-btn');
  const playPauseBtn = document.getElementById('iv-play-pause');
  const progressWrap = document.querySelector('.iv-progress-wrap');
  const progressBarEl = document.getElementById('iv-progress-bar');
  const timeDisplay = document.getElementById('iv-time');

  let trust = 50;
  let morale = 50;
  let burnout = 20;
  let power = 50;

  let currentDecision = null;
  let activeChoice = null;
  let activeEnding = null;
  let hasTriggeredThisDecision = [false, false, false];

  const DECISIONS = [
    {
      id: 1,
      triggerTime: 41,
      tag: "Quyết định 1",
      question: "BẠN LÀ CƯỜNG. BẠN SẼ CHỌN GÌ?",
      choices: [
        {
          text: "TỰ MÌNH CHỐT TOÀN BỘ KẾ HOẠCH",
          sub: "Giữ quyền kiểm soát",
          seekTo: 50,
          endTime: 65,
          jumpTo: 80,
          stats: { trust: -20, morale: -15, burnout: 15, power: -15 },
          statEffects: ["TÍN NHIỆM -20", "TINH THẦN -15", "ÁP LỰC +15", "ĐOÀN KẾT -15"]
        },
        {
          text: "LẮNG NGHE VÀ PHÂN QUYỀN CHO TEAM",
          sub: "Tin tưởng tập thể",
          seekTo: 65,
          endTime: 80,
          jumpTo: 80,
          stats: { trust: 15, morale: 15, burnout: -5, power: 20 },
          statEffects: ["TÍN NHIỆM +15", "TINH THẦN +15", "ÁP LỰC -5", "ĐOÀN KẾT +20"]
        }
      ]
    },
    {
      id: 2,
      triggerTime: 89,
      tag: "Quyết định 2",
      question: "NGÂN SÁCH ĐANG THIẾU NGHIÊM TRỌNG.",
      choices: [
        {
          text: "GIẤU VẤN ĐỀ",
          sub: "Giữ hình ảnh hoàn hảo trước công chúng",
          seekTo: 95,
          endTime: 110,
          jumpTo: 125,
          stats: { trust: -25, morale: -20, burnout: 25, power: -20 },
          statEffects: ["TÍN NHIỆM -25", "TINH THẦN -20", "ÁP LỰC +25", "ĐOÀN KẾT -20"]
        },
        {
          text: "MINH BẠCH VỚI TEAM",
          sub: "Cùng tập thể tìm cách giải quyết",
          seekTo: 110,
          endTime: 125,
          jumpTo: 125,
          stats: { trust: 20, morale: 10, burnout: -10, power: 15 },
          statEffects: ["TÍN NHIỆM +20", "TINH THẦN +10", "ÁP LỰC -10", "ĐOÀN KẾT +15"]
        }
      ]
    },
    {
      id: 3,
      triggerTime: 131,
      tag: "Quyết định 3",
      question: "KHỦNG HOẢNG ĐÃ XẢY RA.",
      choices: [
        {
          text: "QUÁT MẮNG VÀ RA LỆNH TUYỆT ĐỐI",
          sub: "Ép mọi người làm theo mình",
          seekTo: 140,
          endTime: 155,
          jumpTo: null,
          stats: { trust: -35, morale: -30, burnout: 35, power: -30 },
          statEffects: ["TÍN NHIỆM -35", "TINH THẦN -30", "ÁP LỰC +35", "ĐOÀN KẾT -30"]
        },
        {
          text: "TIN TƯỞNG VÀ TRAO QUYỀN CHO TEAM",
          sub: "Cùng nhau cứu lấy chiến dịch",
          seekTo: 155,
          endTime: 170,
          jumpTo: null,
          stats: { trust: 30, morale: 25, burnout: -15, power: 30 },
          statEffects: ["TÍN NHIỆM +30", "TINH THẦN +25", "ÁP LỰC -15", "ĐOÀN KẾT +30"]
        }
      ]
    }
  ];

  const updateStatsHUD = () => {
    trust = Math.max(0, Math.min(100, trust));
    morale = Math.max(0, Math.min(100, morale));
    burnout = Math.max(0, Math.min(100, burnout));
    power = Math.max(0, Math.min(100, power));

    const bTrust = document.getElementById('bar-trust');
    const bMorale = document.getElementById('bar-morale');
    const bBurnout = document.getElementById('bar-burnout');
    const bPower = document.getElementById('bar-power');

    if (bTrust) bTrust.style.width = trust + '%';
    if (bMorale) bMorale.style.width = morale + '%';
    if (bBurnout) bBurnout.style.width = burnout + '%';
    if (bPower) bPower.style.width = power + '%';

    const vTrust = document.getElementById('val-trust');
    const vMorale = document.getElementById('val-morale');
    const vBurnout = document.getElementById('val-burnout');
    const vPower = document.getElementById('val-power');

    if (vTrust) vTrust.textContent = trust;
    if (vMorale) vMorale.textContent = morale;
    if (vBurnout) vBurnout.textContent = burnout;
    if (vPower) vPower.textContent = power;
  };

  const resetGame = () => {
    trust = 50;
    morale = 50;
    burnout = 20;
    power = 50;
    hasTriggeredThisDecision = [false, false, false];
    activeChoice = null;
    activeEnding = null;
    currentDecision = null;
    updateStatsHUD();

    const dOverlay = document.getElementById('decision-overlay');
    const rOverlay = document.getElementById('result-overlay');
    if (dOverlay) dOverlay.style.display = 'none';
    if (rOverlay) rOverlay.style.display = 'none';
  };

  const triggerDecision = (dec) => {
    currentDecision = dec;
    video.pause();

    const dTag = document.getElementById('decision-tag');
    const dQuest = document.getElementById('decision-question');
    const c1Text = document.getElementById('choice-1-text');
    const c1Sub = document.getElementById('choice-1-sub');
    const c2Text = document.getElementById('choice-2-text');
    const c2Sub = document.getElementById('choice-2-sub');

    if (dTag) dTag.textContent = dec.tag;
    if (dQuest) dQuest.textContent = dec.question;
    if (c1Text) c1Text.textContent = dec.choices[0].text;
    if (c1Sub) c1Sub.textContent = dec.choices[0].sub;
    if (c2Text) c2Text.textContent = dec.choices[1].text;
    if (c2Sub) c2Sub.textContent = dec.choices[1].sub;

    const dOverlay = document.getElementById('decision-overlay');
    if (dOverlay) dOverlay.style.display = 'flex';
  };

  const selectChoice = (index) => {
    if (!currentDecision) return;

    const choice = currentDecision.choices[index];
    currentDecision = null;
    activeChoice = choice;

    const dOverlay = document.getElementById('decision-overlay');
    if (dOverlay) dOverlay.style.display = 'none';

    trust += choice.stats.trust;
    morale += choice.stats.morale;
    burnout += choice.stats.burnout;
    power += choice.stats.power;

    updateStatsHUD();

    const resultOverlay = document.getElementById('result-overlay');
    const rBadge = document.getElementById('result-badge');
    const rText = document.getElementById('result-text');
    const rStats = document.getElementById('result-stats');

    if (rBadge) rBadge.textContent = `Lựa chọn ${index + 1}`;
    if (rText) rText.textContent = choice.text;

    if (rStats) {
      rStats.innerHTML = '';
      choice.statEffects.forEach(effect => {
        const pill = document.createElement('span');
        if (effect.includes('ÁP LỰC -') || effect.includes('ÁP LỰC +')) {
          pill.className = 'result-stat-pill ' + (effect.includes('-') ? 'positive' : 'negative');
        } else {
          pill.className = 'result-stat-pill ' + (effect.includes('+') ? 'positive' : 'negative');
        }
        pill.textContent = effect;
        rStats.appendChild(pill);
      });
    }

    if (resultOverlay) resultOverlay.style.display = 'flex';

    setTimeout(() => {
      if (resultOverlay) {
        resultOverlay.style.opacity = '0';
        setTimeout(() => {
          resultOverlay.style.display = 'none';
          resultOverlay.style.opacity = '1';
        }, 300);
      }

      video.currentTime = choice.seekTo;
      video.play();
    }, 3000);
  };

  const determineAndJumpToEnding = () => {
    // Bad Ending conditions: trust < 40 or power < 40 or burnout > 60
    if (trust < 40 || power < 40 || burnout > 60) {
      video.currentTime = 170; // ending-bad is 2:50
      activeEnding = { name: "BAD ENDING", endTime: 195 };
    }
    // Good Ending conditions: trust >= 60 and power >= 60 and burnout <= 40
    else if (trust >= 60 && power >= 60 && burnout <= 40) {
      video.currentTime = 195; // ending-good is 3:15
      activeEnding = { name: "GOOD ENDING", endTime: 220 };
    }
    // Mixed Ending conditions
    else {
      video.currentTime = 220; // ending-mixed is 3:40
      activeEnding = { name: "MIXED ENDING", endTime: 245 };
    }
    video.play();
  };

  const resetTriggersBasedOnTime = (time) => {
    for (let i = 0; i < DECISIONS.length; i++) {
      if (time < DECISIONS[i].triggerTime) {
        hasTriggeredThisDecision[i] = false;
      }
    }
    if (activeChoice && (time < activeChoice.seekTo || time > activeChoice.endTime)) {
      activeChoice = null;
    }
    if (activeEnding && (time < 170 || time > activeEnding.endTime)) {
      activeEnding = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  };

  if (video && overlay && playBtn) {
    const hideOverlay = () => {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    };
    const showOverlay = () => {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
    };

    playBtn.addEventListener('click', () => {
      video.play();
      hideOverlay();
    });

    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);

    // Hide overlay when native controls play
    video.addEventListener('play', () => {
      if (!video.paused) hideOverlay();
      if (video.currentTime < 2) {
        resetGame();
        const overlayText = document.querySelector('.video-overlay-text');
        if (overlayText) overlayText.innerHTML = '🎬 Hào quang hay Tập thể? &middot; Nhấn để bắt đầu';
      }
    });

    // Custom play/pause controls
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', () => { playPauseBtn.textContent = '⏸ Pause'; });
      video.addEventListener('pause', () => { playPauseBtn.textContent = '▶ Play'; });
    }

    // Time update listener
    video.addEventListener('timeupdate', () => {
      const t = video.currentTime;
      const duration = video.duration || 254;

      // Update progress bar
      if (progressBarEl) {
        const pct = (t / duration) * 100;
        progressBarEl.style.width = pct + '%';
      }

      // Update time display
      if (timeDisplay) {
        timeDisplay.textContent = `${formatTime(t)} / ${formatTime(duration)}`;
      }

      // 1. Check active choice ending of scene
      if (activeChoice && t >= activeChoice.endTime) {
        const choice = activeChoice;
        activeChoice = null;
        if (choice.jumpTo !== null) {
          video.currentTime = choice.jumpTo;
        } else {
          determineAndJumpToEnding();
        }
      }

      // 2. Check active ending completion
      if (activeEnding && t >= activeEnding.endTime) {
        const endedName = activeEnding.name;
        activeEnding = null;
        video.pause();
        const overlayText = document.querySelector('.video-overlay-text');
        if (overlayText) {
          overlayText.innerHTML = `🏁 <strong>HOÀN THÀNH: ${endedName}</strong><br/>Nhấn Play để xem lại từ đầu`;
        }
        // Force the video to go back to 0 so next play starts over
        setTimeout(() => { video.currentTime = 0; }, 500);
        showOverlay();
      }

      // 3. Check for decision points triggers
      for (let i = 0; i < DECISIONS.length; i++) {
        const dec = DECISIONS[i];
        if (t >= dec.triggerTime && t < dec.triggerTime + 1 && !hasTriggeredThisDecision[i]) {
          hasTriggeredThisDecision[i] = true;
          triggerDecision(dec);
          break;
        }
      }
    });

    // Custom progress bar click seek
    if (progressWrap) {
      progressWrap.addEventListener('click', (e) => {
        const rect = progressWrap.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickPct = clickX / width;
        const newTime = clickPct * (video.duration || 254);
        video.currentTime = newTime;
        resetTriggersBasedOnTime(newTime);
      });
    }

    // Choices event listeners
    const choice1El = document.getElementById('choice-1');
    const choice2El = document.getElementById('choice-2');
    if (choice1El) choice1El.addEventListener('click', () => selectChoice(0));
    if (choice2El) choice2El.addEventListener('click', () => selectChoice(1));

    // Keyboard controls for 1 and 2
    document.addEventListener('keydown', (e) => {
      if (!currentDecision) return;
      if (e.key === '1') {
        selectChoice(0);
      } else if (e.key === '2') {
        selectChoice(1);
      }
    });

    // Initial load
    updateStatsHUD();
  }


  /* ── 7. SMOOTH SCROLL for CTA buttons ─ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ── 8. Q&A SECTION – stagger badge animation ── */
  const qaSection = document.getElementById('qa');
  if (qaSection) {
    const qaBadges = qaSection.querySelectorAll('.qa-group-badge, .qa-group-chip');
    const qaObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        qaBadges.forEach((badge, i) => {
          setTimeout(() => {
            badge.style.opacity = '1';
            badge.style.transform = 'translateY(0)';
          }, i * 100);
        });
      }
    }, { threshold: 0.3 });

    // Initial state for badges
    qaBadges.forEach(badge => {
      badge.style.opacity = '0';
      badge.style.transform = 'translateY(20px)';
      badge.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    qaObserver.observe(qaSection);
  }


  /* ── 9. KEYBOARD SHORTCUT: 'Q' → jump to Q&A ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'q' || e.key === 'Q') {
      const qa = document.getElementById('qa');
      if (qa) qa.scrollIntoView({ behavior: 'smooth' });
    }
  });

});
