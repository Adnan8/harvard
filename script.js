/* ============================================
   HARVARD UNIVERSITY — MENTAL HEALTH PAGE
   Navigation, Search & Animations
   ============================================ */
(function () {
    'use strict';

    /* ─── Element refs ─────────────────────────── */
    const btnMenu       = document.getElementById('btnMenu');
    const btnSearch     = document.getElementById('btnSearch');
    const navOverlay    = document.getElementById('navOverlay');
    const navCloseBtn   = document.getElementById('navCloseBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const menuLabel     = document.getElementById('menuLabel');
    const iconHamburger = btnMenu?.querySelector('.icon-hamburger');
    const iconClose     = btnMenu?.querySelector('.icon-close');
    const siteHeader    = document.getElementById('siteHeader');

    const primaryItems  = document.querySelectorAll('.nav-primary-item');
    const primaryList   = document.querySelector('.nav-primary-list');
    const subPanels     = document.querySelectorAll('.nav-subpanel');

    let menuOpen   = false;
    let searchOpen = false;
    let activePanel = null;

    /* ═══════════════════════════════════════════
       PARTICLE CANVAS BACKGROUND
       ═══════════════════════════════════════════ */
    const canvas = document.getElementById('navCanvas');
    const ctx    = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let animFrame = null;

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    function randomBetween(a, b) { return a + Math.random() * (b - a); }

    function createParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 6000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x:  Math.random() * canvas.width,
                y:  Math.random() * canvas.height,
                vx: randomBetween(-0.18, 0.18),
                vy: randomBetween(-0.12, 0.12),
                r:  randomBetween(1, 2.2),
                // golden-amber or blue-white
                hue: Math.random() > 0.55 ? randomBetween(38, 52) : randomBetween(210, 230),
                alpha: randomBetween(0.3, 0.85),
            });
        }
    }

    function drawParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connection lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 90) {
                    const lineAlpha = (1 - dist / 90) * 0.12;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(180,160,100,${lineAlpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
            ctx.fill();

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
        }
    }

    function animateParticles() {
        drawParticles();
        animFrame = requestAnimationFrame(animateParticles);
    }

    function startParticles() {
        resizeCanvas();
        createParticles();
        if (!animFrame) animateParticles();
    }

    function stopParticles() {
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    }

    /* ═══════════════════════════════════════════
       NAV PANEL SWITCHING
       ═══════════════════════════════════════════ */
    function isMobile() { return window.innerWidth <= 640; }

    function removeInlinePanels() {
        document.querySelectorAll('.nav-subpanel-inline').forEach(el => el.remove());
    }

    function insertInlinePanel(item, panelId) {
        removeInlinePanels();
        const source = document.getElementById(`panel-${panelId}`);
        if (!source) return;
        const inner = source.querySelector('.nav-subpanel-inner');
        if (!inner) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'nav-subpanel-inline';
        wrapper.innerHTML = inner.innerHTML;
        item.appendChild(wrapper);
    }

    function setActivePanel(panelId) {
        activePanel = panelId;
        const mobile = isMobile();

        primaryItems.forEach(item => {
            const isActive = item.dataset.panel === panelId;
            item.classList.toggle('active', isActive);
            item.querySelector('.nav-primary-btn').setAttribute('aria-expanded', String(isActive));

            if (mobile) {
                // Remove stale inline panels from non-active items
                if (!isActive) {
                    const old = item.querySelector('.nav-subpanel-inline');
                    if (old) old.remove();
                } else {
                    insertInlinePanel(item, panelId);
                }
            }
        });

        primaryList.classList.toggle('has-active', !!panelId);

        // Desktop: show right-side subpanel
        if (!mobile) {
            subPanels.forEach(panel => {
                panel.classList.toggle('active', panel.id === `panel-${panelId}`);
            });
        }
    }

    function clearActivePanel() {
        activePanel = null;
        removeInlinePanels();
        primaryItems.forEach(item => {
            item.classList.remove('active');
            item.querySelector('.nav-primary-btn').setAttribute('aria-expanded', 'false');
        });
        primaryList.classList.remove('has-active');
        subPanels.forEach(p => p.classList.remove('active'));
    }

    // Attach click handlers to primary nav buttons
    primaryItems.forEach(item => {
        const btn     = item.querySelector('.nav-primary-btn');
        const panelId = item.dataset.panel;

        btn.addEventListener('click', () => {
            if (activePanel === panelId) {
                clearActivePanel();
            } else {
                setActivePanel(panelId);
            }
        });

        // Mouse enter only on desktop
        item.addEventListener('mouseenter', () => {
            if (!isMobile()) setActivePanel(panelId);
        });
    });

    /* ═══════════════════════════════════════════
       OPEN / CLOSE MENU
       ═══════════════════════════════════════════ */
    function openMenu() {
        menuOpen = true;
        navOverlay.classList.add('open');
        navOverlay.setAttribute('aria-hidden', 'false');
        btnMenu.classList.add('active');
        if (iconHamburger) iconHamburger.style.display = 'none';
        if (iconClose)     iconClose.style.display     = 'block';
        if (menuLabel)     menuLabel.textContent        = 'Close';
        document.body.style.overflow = 'hidden';
        if (searchOpen) closeSearch();
        // Start particles after overlay visible
        setTimeout(startParticles, 50);
        // Auto-open first panel
        setActivePanel('academics');
    }

    function closeMenu() {
        menuOpen = false;
        navOverlay.classList.remove('open');
        navOverlay.setAttribute('aria-hidden', 'true');
        btnMenu.classList.remove('active');
        if (iconHamburger) iconHamburger.style.display = 'block';
        if (iconClose)     iconClose.style.display     = 'none';
        if (menuLabel)     menuLabel.textContent        = 'Menu';
        document.body.style.overflow = '';
        clearActivePanel();
        stopParticles();
    }

    btnMenu?.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
    navCloseBtn?.addEventListener('click', closeMenu);

    /* ═══════════════════════════════════════════
       SEARCH OVERLAY
       ═══════════════════════════════════════════ */
    function openSearch() {
        searchOpen = true;
        searchOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchOverlay.querySelector('.search-input')?.focus(), 60);
        if (menuOpen) closeMenu();
    }
    function closeSearch() {
        searchOpen = false;
        searchOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    btnSearch?.addEventListener('click', () => searchOpen ? closeSearch() : openSearch());
    searchOverlay?.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });

    /* ═══════════════════════════════════════════
       KEYBOARD
       ═══════════════════════════════════════════ */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (menuOpen)   closeMenu();
            if (searchOpen) closeSearch();
        }
    });

    /* ═══════════════════════════════════════════
       HEADER SCROLL EFFECT
       transparent over hero → solid when scrolled
       ═══════════════════════════════════════════ */
    function updateHeader() {
        if (!siteHeader) return;
        const heroH = document.querySelector('.hero')?.offsetHeight || 400;
        if (window.scrollY > heroH * 0.35) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    /* ═══════════════════════════════════════════
       SCROLL-TRIGGERED FADE-IN
       ═══════════════════════════════════════════ */
    const fadeStyle = document.createElement('style');
    fadeStyle.textContent = `
        .fade-up {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-up.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(fadeStyle);

    const fadeTargets = document.querySelectorAll(
        '.stat-card, .treatment-list-item, .habit-card, .content-card,' +
        '.dark-card, .worklife-item, .delving-card, .campus-card,' +
        '.related-card, .treatment-main, .worklife-main'
    );

    fadeTargets.forEach((el, i) => {
        el.classList.add('fade-up');
        el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    });

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
            });
        }, { threshold: 0.1 });
        fadeTargets.forEach(el => io.observe(el));
    } else {
        fadeTargets.forEach(el => el.classList.add('visible'));
    }

    /* ═══════════════════════════════════════════
       CANVAS RESIZE
       ═══════════════════════════════════════════ */
    window.addEventListener('resize', () => {
        if (menuOpen && canvas) {
            resizeCanvas();
            createParticles();
        }
    });

})();
