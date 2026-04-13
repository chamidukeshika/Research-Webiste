const body = document.body;
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const primaryNav = document.querySelector('#primary-nav');
const siteSearchForm = document.querySelector('.site-search');
const siteSearchInput = document.querySelector('#site-search-input');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const sections = Array.from(document.querySelectorAll('main section[id]'));
const sectionBlocks = Array.from(document.querySelectorAll('main .section'));
const domainTabs = Array.from(document.querySelectorAll('.domain-tab'));
const domainPanels = Array.from(document.querySelectorAll('.domain-panel'));
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const countItems = Array.from(document.querySelectorAll('[data-count]'));
const tiltItems = Array.from(document.querySelectorAll('[data-tilt]'));
const milestoneItems = Array.from(document.querySelectorAll('.milestone-item'));
const contactForm = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');
const floatingTopButton = document.querySelector('.floating-top');
const topLinks = Array.from(document.querySelectorAll('a[href="#top"]'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const contactRecipient = 'chamidukeshikaz@gmail.com';
const galleryItems = Array.from(document.querySelectorAll('[data-gallery-item]'));
const galleryModal = document.querySelector('.gallery-modal');
const galleryModalImage = document.querySelector('.gallery-modal-image');
const galleryModalTitle = document.querySelector('.gallery-modal-title');
const galleryModalCounter = document.querySelector('.gallery-modal-counter');
const galleryModalCloseButton = document.querySelector('.gallery-modal-close');
const galleryModalCloseButtons = Array.from(document.querySelectorAll('[data-gallery-close]'));
const galleryPrevButton = document.querySelector('[data-gallery-prev]');
const galleryNextButton = document.querySelector('[data-gallery-next]');

let activeGalleryIndex = 0;
let lastGalleryTrigger = null;

function optimizeImageLoading() {
  const contentImages = Array.from(document.querySelectorAll('main img'));

  contentImages.forEach((img, index) => {
    const inHero = Boolean(img.closest('.hero-section'));

    if (!img.hasAttribute('decoding')) {
      img.decoding = 'async';
    }

    if (!img.hasAttribute('loading')) {
      img.loading = inHero && index < 2 ? 'eager' : 'lazy';
    }

    if (!img.hasAttribute('fetchpriority') && img.loading === 'eager') {
      img.fetchPriority = 'high';
    }
  });
}

const themeLabels = {
  dark: { next: 'light', title: 'Switch to light theme' },
  light: { next: 'dark', title: 'Switch to dark theme' }
};

const themeIcons = {
  dark: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
      <path d="M12 2.5V5.2M12 18.8V21.5M21.5 12H18.8M5.2 12H2.5M18.7 5.3L16.8 7.2M7.2 16.8L5.3 18.7M18.7 18.7L16.8 16.8M7.2 7.2L5.3 5.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
    </svg>
  `,
  light: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 14.2A7.7 7.7 0 1 1 9.8 4 6.4 6.4 0 0 0 20 14.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
    </svg>
  `
};

const searchAliases = {
  home: 'hero introduction overview smart stick assistive mobility landing',
  domain: 'research literature survey research gap research problem objectives methodology technologies',
  milestones: 'timeline assessment stages proposal progress final assessment viva review',
  documents: 'documents files reports checklist paper pdf deliverables proposal',
  presentations: 'presentation slides deck demo media video progress pptx',
  about: 'about team members profiles contacts identities researchers',
  contact: 'contact email phone inquiry message team reach'
};

let setActiveDomainPanel = null;

function applyTheme(theme) {
  body.dataset.theme = theme;

  if (!themeToggle || !themeIcon) {
    return;
  }

  const nextTheme = themeLabels[theme]?.next || 'light';
  const buttonTitle = themeLabels[theme]?.title || 'Switch theme';

  themeIcon.innerHTML = themeIcons[theme] || '';
  themeToggle.setAttribute('aria-label', buttonTitle);
  themeToggle.setAttribute('title', buttonTitle);
  themeToggle.dataset.nextTheme = nextTheme;
}

let savedTheme = 'dark';

try {
  savedTheme = localStorage.getItem('site-theme') || 'dark';
} catch (error) {
  savedTheme = 'dark';
}

applyTheme(savedTheme);
optimizeImageLoading();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);

    try {
      localStorage.setItem('site-theme', nextTheme);
    } catch (error) {
      // Ignore storage failures for file-based previews.
    }
  });
}

function setMenuState(isOpen) {
  if (!menuButton || !primaryNav) {
    return;
  }

  menuButton.setAttribute('aria-expanded', String(isOpen));
  primaryNav.classList.toggle('open', isOpen);
}

if (menuButton && primaryNav) {
  menuButton.addEventListener('click', () => {
    const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuState(!isExpanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function scrollToSection(section) {
  if (!section) {
    return;
  }

  const offset = (header?.offsetHeight || 0) + 28;
  const top = section.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top,
    behavior: reduceMotion.matches ? 'auto' : 'smooth'
  });

  section.classList.remove('search-targeted');
  window.requestAnimationFrame(() => {
    section.classList.add('search-targeted');
  });

  window.clearTimeout(section.searchTargetTimeout);
  section.searchTargetTimeout = window.setTimeout(() => {
    section.classList.remove('search-targeted');
  }, 1800);
}

const searchEntries = sections.map((section) => {
  const navLabel = normalizeText(
    navLinks.find((link) => link.getAttribute('href') === `#${section.id}`)?.textContent
  );
  const heading = normalizeText(section.querySelector('h2')?.textContent);
  const eyebrow = normalizeText(section.querySelector('.eyebrow')?.textContent);
  const aliases = normalizeText(searchAliases[section.id] || '');
  const content = normalizeText(section.textContent);

  return {
    section,
    id: normalizeText(section.id),
    navLabel,
    heading,
    eyebrow,
    aliases,
    content
  };
});

function scoreSearchEntry(query, entry) {
  const tokens = query.split(' ');
  let score = 0;

  if (entry.id === query) {
    score += 140;
  }

  if (entry.navLabel === query) {
    score += 120;
  }

  if (entry.heading.includes(query)) {
    score += 80;
  }

  if (entry.aliases.includes(query)) {
    score += 64;
  }

  if (entry.content.includes(query)) {
    score += 28;
  }

  tokens.forEach((token) => {
    if (!token) {
      return;
    }

    if (entry.id.includes(token)) {
      score += 32;
    }

    if (entry.navLabel.includes(token)) {
      score += 26;
    }

    if (entry.heading.includes(token)) {
      score += 18;
    }

    if (entry.eyebrow.includes(token) || entry.aliases.includes(token)) {
      score += 14;
    }

    if (entry.content.includes(token)) {
      score += 5;
    }
  });

  return score;
}

function findSearchMatch(query) {
  let bestMatch = null;
  let bestScore = 0;

  searchEntries.forEach((entry) => {
    const score = scoreSearchEntry(query, entry);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  });

  return bestScore > 0 ? bestMatch : null;
}

function findDomainPanelTarget(query) {
  if (!domainTabs.length) {
    return '';
  }

  const tokens = query.split(' ');
  const match = domainTabs.find((tab) => {
    const label = normalizeText(tab.textContent);
    return (
      label.includes(query) ||
      query.includes(label) ||
      tokens.every((token) => label.includes(token)) ||
      tokens.some((token) => token.length > 3 && label.includes(token))
    );
  });

  return match?.dataset.domainTarget || '';
}

function normalizeGalleryIndex(index) {
  if (!galleryItems.length) {
    return 0;
  }

  return (index + galleryItems.length) % galleryItems.length;
}

function updateGalleryModal(index) {
  if (!galleryModalImage || !galleryModalTitle || !galleryModalCounter || !galleryItems.length) {
    return;
  }

  activeGalleryIndex = normalizeGalleryIndex(index);

  const item = galleryItems[activeGalleryIndex];
  const imageSrc = item.dataset.gallerySrc || item.querySelector('img')?.getAttribute('src') || '';
  const imageAlt = item.dataset.galleryAlt || item.querySelector('img')?.getAttribute('alt') || 'Gallery image';

  galleryModalImage.src = imageSrc;
  galleryModalImage.alt = imageAlt;
  galleryModalTitle.textContent = imageAlt;
  galleryModalCounter.textContent = `${activeGalleryIndex + 1} / ${galleryItems.length}`;
}

function openGalleryModal(index) {
  if (!galleryModal || !galleryItems.length) {
    return;
  }

  lastGalleryTrigger = galleryItems[normalizeGalleryIndex(index)];
  updateGalleryModal(index);
  galleryModal.hidden = false;
  galleryModal.setAttribute('aria-hidden', 'false');
  body.classList.add('gallery-modal-open');
  galleryModalCloseButton?.focus({ preventScroll: true });
}

function closeGalleryModal() {
  if (!galleryModal) {
    return;
  }

  galleryModal.hidden = true;
  galleryModal.setAttribute('aria-hidden', 'true');
  body.classList.remove('gallery-modal-open');

  if (galleryModalImage) {
    galleryModalImage.src = '';
    galleryModalImage.alt = '';
  }

  lastGalleryTrigger?.focus({ preventScroll: true });
}

function stepGallery(direction) {
  if (!galleryModal || galleryModal.hidden) {
    return;
  }

  updateGalleryModal(activeGalleryIndex + direction);
}

function setActiveNavLink() {
  const offset = 140;
  let activeId = sections[0]?.id || 'home';

  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - offset) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
  });
}

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const maxScrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScrollable > 0 ? scrollTop / maxScrollable : 0;

  document.documentElement.style.setProperty('--scroll-progress', String(progress));

  if (header) {
    header.classList.toggle('is-condensed', scrollTop > 18);
  }
}

function updateActiveMilestone() {
  if (!milestoneItems.length) {
    return;
  }

  const focusLine = window.innerHeight * 0.42;
  let activeItem = milestoneItems[0];
  let minDistance = Number.POSITIVE_INFINITY;

  milestoneItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - focusLine);

    if (distance < minDistance) {
      minDistance = distance;
      activeItem = item;
    }
  });

  milestoneItems.forEach((item) => {
    item.classList.toggle('is-active', item === activeItem);
  });
}

function updateBackToTopVisibility() {
  if (!floatingTopButton) {
    return;
  }

  const shouldShow = window.scrollY > 8;
  floatingTopButton.classList.toggle('is-visible', shouldShow);
}

function handleScroll() {
  setActiveNavLink();
  updateScrollProgress();
  updateActiveMilestone();
  updateBackToTopVisibility();
}

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll, { passive: true });
handleScroll();

if (topLinks.length) {
  topLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });

      setMenuState(false);
    });
  });
}

if (domainTabs.length && domainPanels.length) {
  setActiveDomainPanel = (target) => {
    domainTabs.forEach((tab) => {
      const isActive = tab.dataset.domainTarget === target;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    domainPanels.forEach((panel) => {
      const isActive = panel.dataset.domainPanel === target;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });
  };

  domainTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      setActiveDomainPanel(tab.dataset.domainTarget);
    });

    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
        return;
      }

      event.preventDefault();

      let nextIndex = index;

      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % domainTabs.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + domainTabs.length) % domainTabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = domainTabs.length - 1;
      }

      const nextTab = domainTabs[nextIndex];
      nextTab.focus();
      setActiveDomainPanel(nextTab.dataset.domainTarget);
    });
  });

  const initialTab = domainTabs.find((tab) => tab.classList.contains('active')) || domainTabs[0];
  setActiveDomainPanel(initialTab.dataset.domainTarget);
}

if (siteSearchForm && siteSearchInput) {
  siteSearchInput.addEventListener('input', () => {
    siteSearchForm.classList.remove('is-invalid');
    siteSearchInput.removeAttribute('aria-invalid');
  });

  siteSearchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const query = normalizeText(siteSearchInput.value);

    if (!query) {
      siteSearchInput.focus();
      return;
    }

    const match = findSearchMatch(query);

    if (!match) {
      siteSearchForm.classList.add('is-invalid');
      siteSearchInput.setAttribute('aria-invalid', 'true');
      return;
    }

    siteSearchForm.classList.remove('is-invalid');
    siteSearchInput.removeAttribute('aria-invalid');

    if (match.section.id === 'domain' && setActiveDomainPanel) {
      const domainTarget = findDomainPanelTarget(query);

      if (domainTarget) {
        setActiveDomainPanel(domainTarget);
      }
    }

    scrollToSection(match.section);
    setMenuState(false);
  });
}

if (galleryItems.length && galleryModal) {
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      openGalleryModal(index);
    });
  });

  galleryModalCloseButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeGalleryModal();
    });
  });

  galleryPrevButton?.addEventListener('click', () => {
    stepGallery(-1);
  });

  galleryNextButton?.addEventListener('click', () => {
    stepGallery(1);
  });

  document.addEventListener('keydown', (event) => {
    if (galleryModal.hidden) {
      return;
    }

    if (event.key === 'Escape') {
      closeGalleryModal();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepGallery(-1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepGallery(1);
    }
  });
}

function animateCount(node) {
  const target = Number(node.dataset.count || 0);

  if (!Number.isFinite(target) || target <= 0) {
    return;
  }

  const duration = 1200;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = String(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  if (sectionBlocks.length) {
    sectionBlocks[0].classList.add('is-visible-section');

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible-section');
          sectionObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.01,
        rootMargin: '220px 0px'
      }
    );

    sectionBlocks.slice(1).forEach((section) => sectionObserver.observe(section));
  }

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  if (countItems.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.65 }
    );

    countItems.forEach((item) => countObserver.observe(item));
  }
} else {
  sectionBlocks.forEach((section) => section.classList.add('is-visible-section'));
  revealItems.forEach((item) => item.classList.add('is-visible'));
  countItems.forEach((item) => {
    item.textContent = item.dataset.count || item.textContent;
  });
}

if (!reduceMotion.matches) {
  tiltItems.forEach((item) => {
    item.addEventListener('mousemove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = y * -8;
      const rotateY = x * 10;

      item.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      if (formStatus) {
        formStatus.textContent = 'Complete all required fields before opening the email draft.';
      }
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();

    const mailtoSubject = encodeURIComponent(`[Project Website] ${subject}`);
    const bodyText = [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message
    ].join('\n');
    const mailtoBody = encodeURIComponent(bodyText);

    window.location.href = `mailto:${contactRecipient}?subject=${mailtoSubject}&body=${mailtoBody}`;

    if (formStatus) {
      formStatus.textContent = 'Email draft opened in your default mail client.';
    }
  });
}
