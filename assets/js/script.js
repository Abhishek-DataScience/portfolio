(() => {
  'use strict';

  /* ---------------------------------------------------------------
   * Sticky header: add a background once the page scrolls
   * ------------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------------------------------------------------------
   * Mobile navigation toggle
   * ------------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  /* ---------------------------------------------------------------
   * Scroll-reveal: fade + rise sections into view
   * ------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------------
   * Animated counters for the impact stats
   * ------------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-counter]');
  const COUNT_DURATION = 1700;

  const animateCounter = (el) => {
    const target = Number(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / COUNT_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString('en-IN') + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => {
      counter.textContent = (counter.dataset.target || '0') + (counter.dataset.suffix || '');
    });
  }

  /* ---------------------------------------------------------------
   * Hide the scroll cue once the visitor starts scrolling, and let
   * it act as a shortcut to the next section
   * ------------------------------------------------------------- */
  const scrollCue = document.getElementById('scrollCue');
  if (scrollCue) {
    scrollCue.addEventListener('click', () => {
      document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' });
    });
    window.addEventListener(
      'scroll',
      () => {
        scrollCue.style.opacity = window.scrollY > 80 ? '0' : '';
        scrollCue.style.pointerEvents = window.scrollY > 80 ? 'none' : '';
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------------
   * Contact form — submits to a Google Sheet via Apps Script Web App.
   * Falls back to a mailto link if the request fails.
   * ------------------------------------------------------------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbykJudhwPJDixfIzUK7RE9USuLkPRf9Eh0f6S-jL3E5SWa1mCExPXSb4qUUQBgl3FKtEg/exec';

  if (form && status) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        status.textContent = 'Please fill in every field before sending.';
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      status.textContent = 'Sending your message…';

      try {
        await fetch(SHEET_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ name, email, message }),
        });
        status.textContent = 'Thank you — your message has been sent. I will get back to you shortly.';
        form.reset();
      } catch (error) {
        const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:abhi.banerjee0044@gmail.com?subject=${subject}&body=${body}`;
        status.textContent = 'Opening your email client to send this message — thank you for reaching out.';
        form.reset();
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ---------------------------------------------------------------
   * Footer year
   * ------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
