// DUBEY PERFUME — UNIFIED NAVIGATION DRAWER CONTROLLER
(function () {
  function initNavDrawer() {
    const menu = document.getElementById('menu');
    const burgerBtns = document.querySelectorAll('#burger, .nav-menu-btn');
    const closeBtns = document.querySelectorAll('#menuClose, .menu-close-btn');
    const previewImg = document.getElementById('menuPreviewImg');
    const previewTag = document.getElementById('menuPreviewTag');
    const previewTitle = document.getElementById('menuPreviewTitle');
    const menuRows = document.querySelectorAll('.menu-row');

    function openMenu(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!menu) return;
      menu.classList.add('on');
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }
    }

    function closeMenu(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!menu) return;
      menu.classList.remove('on');
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (window.lenis && typeof window.lenis.start === 'function') {
        window.lenis.start();
      }
    }

    burgerBtns.forEach(function (btn) {
      btn.removeEventListener('click', openMenu);
      btn.addEventListener('click', openMenu);
    });

    closeBtns.forEach(function (btn) {
      btn.removeEventListener('click', closeMenu);
      btn.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu && (menu.classList.contains('on') || menu.classList.contains('open'))) {
        closeMenu(e);
      }
    });

    // Dynamic hover previews for desktop layout (Image 2)
    menuRows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        const img = row.getAttribute('data-img');
        const meta = row.getAttribute('data-meta');
        const titleEl = row.querySelector('.menu-title');
        const title = titleEl ? titleEl.textContent : '';

        if (previewImg && img) previewImg.src = img;
        if (previewTag && meta) previewTag.textContent = meta;
        if (previewTitle && title) previewTitle.textContent = title;
      });
    });
  }

  // Ensure background audio is paused on all secondary pages
  var currentPath = window.location.pathname.toLowerCase();
  var isHome = currentPath === '/' || currentPath === '' || currentPath.endsWith('/index.html') || currentPath.endsWith('/dubey/') || currentPath.endsWith('/dubey/index.html');
  if (!isHome) {
    var bg = document.getElementById('dubeyBgAudio');
    if (bg) {
      bg.pause();
    }
  }

  // Translucent Floating Header Scroll Controller
  function initNavScroll() {
    var nav = document.querySelector('.nav, header.nav');
    if (!nav) return;

    function handleScroll() {
      var y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y > 25) {
        nav.classList.add('scrolled');
        nav.classList.remove('at-top');
      } else {
        nav.classList.remove('scrolled');
        nav.classList.add('at-top');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function initAll() {
    initNavDrawer();
    initNavScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
