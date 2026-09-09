(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.site-nav');

  const closeMenu = (restoreFocus = false) => {
    if (!menuButton || !menu) return;
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'メニューを開く');
    menuButton.querySelector('i').className = 'fa-solid fa-bars';
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuButton.focus();
  };

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const opening = menuButton.getAttribute('aria-expanded') !== 'true';
      if (opening) {
        menu.classList.add('open');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'メニューを閉じる');
        menuButton.querySelector('i').className = 'fa-solid fa-xmark';
        document.body.classList.add('menu-open');
      } else {
        closeMenu();
      }
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu(true);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  const gallery = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');

  const shuffle = (items) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  };

  const openLightbox = (source, description) => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = source;
    lightboxImage.alt = description;
    lightboxCaption.textContent = description;
    lightbox.showModal();
  };

  if (gallery && Array.isArray(window.GALLERY_IMAGES)) {
    shuffle(window.GALLERY_IMAGES).forEach(({ file, alt }) => {
      const button = document.createElement('button');
      const image = document.createElement('img');
      const source = `images/gallery/${file}`;
      button.type = 'button';
      button.className = 'gallery-item';
      button.setAttribute('aria-label', `${alt}を拡大表示`);
      image.src = source;
      image.alt = alt;
      image.loading = 'lazy';
      image.addEventListener('error', () => button.remove());
      button.append(image);
      button.addEventListener('click', () => openLightbox(source, alt));
      gallery.append(button);
    });
  }

  lightboxClose?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
})();

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.getElementById('page-loader');
  const hero = document.querySelector('.hero');
  const header = document.querySelector('.site-header');
  const backToTop = document.querySelector('.back-to-top');
  const navigationLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

  const finishOpening = window.finishPageOpening || (() => {
    loader?.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
    hero?.classList.add('hero-ready');
  });

  if (reduceMotion) {
    finishOpening();
  } else {
    window.addEventListener('load', () => window.setTimeout(finishOpening, 650), { once: true });
    window.setTimeout(finishOpening, 2200);
  }

  const revealGroups = [
    ['.section-heading', 'left'],
    ['.facts > div', 'up'],
    ['.participation-layout > *', 'up'],
    ['.notice', 'up'],
    ['.split-copy', 'left'],
    ['.split-photo', 'right'],
    ['.rules li', 'up'],
    ['.gallery-item', 'up'],
    ['.craft-copy', 'left'],
    ['.craft-photo', 'right'],
    ['.columns > *', 'up'],
    ['.brand-site-link', 'up'],
    ['.link-list > a', 'up']
  ];

  const revealElements = [];
  revealGroups.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add('reveal');
      if (direction !== 'up') element.dataset.reveal = direction;
      element.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 80}ms`);
      revealElements.push(element);
    });
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const sections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-32% 0px -58% 0px', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  let previousScroll = window.scrollY;
  let ticking = false;
  const parallaxItems = [...document.querySelectorAll('.hero-photo, .split-photo, .craft-photo')];

  const updateScrollEffects = () => {
    const currentScroll = window.scrollY;
    header?.classList.toggle('is-scrolled', currentScroll > 20);
    header?.classList.toggle('is-hidden', currentScroll > previousScroll && currentScroll > 220 && !document.body.classList.contains('menu-open'));
    backToTop?.classList.toggle('is-visible', currentScroll > 650);

    if (!reduceMotion) {
      parallaxItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.035;
        item.style.setProperty('--parallax-y', `${Math.max(-18, Math.min(18, offset))}px`);
      });
    }

    previousScroll = Math.max(0, currentScroll);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();
})();
