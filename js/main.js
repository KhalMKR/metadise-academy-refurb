/* ============================================================
   Metadise Academy – Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  /* ----------------------------------------------------------
     Load HTML components into placeholders
  ---------------------------------------------------------- */
  const componentSlots = document.querySelectorAll('[data-component]');

  /**
   * Performance Fix: YouTube Facade Pattern
   * Swaps preview image for actual iframe only on click.
   */
  function initVideoFacades() {
    const facades = document.querySelectorAll('.video-facade');
    facades.forEach(facade => {
      facade.addEventListener('click', function() {
        const videoId = this.dataset.videoId;
        // Use youtube-nocookie for performance & privacy
        this.innerHTML = `
          <iframe 
            title="YouTube video player"
            src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>`;
      });
    });
  }

  await Promise.all(Array.from(componentSlots).map(async (slot) => {
    const source = slot.getAttribute('data-src');
    if (!source) return;

    try {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to load ${source}`);
      }

      slot.outerHTML = await response.text();
    } catch (error) {
      console.error(error);
    }
  }));

  window.dispatchEvent(new CustomEvent('metadise:components-loaded'));
  initVideoFacades();

  window.addEventListener('metadise:components-loaded', () => {
    initVideoFacades();
  }, { once: true });

  if (window.AOS) {
    AOS.init({
      once: true,
      duration: 700,
      offset: 80,
    });
  }

  

  /* ----------------------------------------------------------
     Mobile navigation toggle
  ---------------------------------------------------------- */
  const navToggle = document.querySelector('.nav__toggle');
  const navLinks  = document.querySelector('.nav__links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------
     Navbar (new component) mobile navigation toggle
  ---------------------------------------------------------- */
  const navbarToggle = document.querySelector('.navbar__toggle');
  const navbarMenu = document.querySelector('.navbar__menu');

  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
      const isOpen = navbarMenu.classList.toggle('is-open');
      navbarToggle.classList.toggle('is-open', isOpen);
      navbarToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    navbarMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navbarMenu.classList.remove('is-open');
        navbarToggle.classList.remove('is-open');
        navbarToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------
     Active nav link based on scroll position
  ---------------------------------------------------------- */
  const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');

  const highlightNav = () => {
    let currentId = '';

    document.querySelectorAll('section[id]').forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentId = section.getAttribute('id');
      }
    });

    navAnchors.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${currentId}`
      );
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav(); // run once on load

  /* ----------------------------------------------------------
     Hero slideshow with fade transition
  ---------------------------------------------------------- */
  const heroCarousel = document.querySelector('[data-hero-carousel]');

  if (heroCarousel) {
    const slides = Array.from(heroCarousel.querySelectorAll('[data-hero-slide]'));
    const prevButton = heroCarousel.querySelector('[data-hero-prev]');
    const nextButton = heroCarousel.querySelector('[data-hero-next]');
    const HERO_SLIDE_INTERVAL_MS = 5000;
    let currentSlide = 0;
    let slideTimer;

    const setActiveSlide = (index) => {
      if (!slides.length) return;

      currentSlide = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === currentSlide;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
    };

    const advanceSlide = (step) => {
      setActiveSlide(currentSlide + step);
    };

    const goToNextSlide = () => {
      advanceSlide(1);
    };

    const restartTimer = () => {
      clearInterval(slideTimer);
      slideTimer = setInterval(goToNextSlide, HERO_SLIDE_INTERVAL_MS);
    };

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        advanceSlide(-1);
        restartTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        goToNextSlide();
        restartTimer();
      });
    }

    heroCarousel.addEventListener('mouseenter', () => clearInterval(slideTimer));
    heroCarousel.addEventListener('mouseleave', restartTimer);

    setActiveSlide(0);
    restartTimer();
  }

  /* ----------------------------------------------------------
     Contact form – client-side validation & toast feedback
  ---------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const toast       = document.getElementById('toast');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name    = contactForm.querySelector('#name').value.trim();
      const email   = contactForm.querySelector('#email').value.trim();
      const message = contactForm.querySelector('#message').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate form submission
      showToast('Message sent! We\'ll be in touch soon. 🎉');
      contactForm.reset();
    });
  }

  /**
   * Display a temporary toast notification.
   * @param {string} message - Text to display.
   * @param {'success'|'error'} [type='success']
   */
  function showToast(message, type = 'success') {
    if (!toast) return;

    toast.textContent = message;
    toast.style.backgroundColor = type === 'error' ? '#ef4444' : '#22c55e';
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  /**
   * Basic email format validation.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ----------------------------------------------------------
     Load and Render Courses from JSON
  ---------------------------------------------------------- */
  const coursesGrid = document.getElementById('coursesGrid');
  const courseSearchInput = document.getElementById('courseSearchInput');
  const courseSearchClear = document.getElementById('courseSearchClear');
  const courseSearchResults = document.getElementById('courseSearchResults');

  if (coursesGrid) {
    if (window.MetadiseCourseCards) {
      if (courseSearchInput) {
        window.MetadiseCourseCards.initCourseSearch({
          grid: coursesGrid,
          searchInput: courseSearchInput,
          clearButton: courseSearchClear,
          resultsLabel: courseSearchResults,
        });
      } else {
        window.MetadiseCourseCards.renderCoursesIntoGrid(coursesGrid);
      }
    }
  }

  /* ----------------------------------------------------------
     Scroll-reveal animation (lightweight, no library)
  ---------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.card, .feature-item, .course-card');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity  = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      revealObserver.observe(el);
    });
  }

});
