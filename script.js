const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
    observer.observe(item);
  });
}

const glow = document.querySelector('.cursor-glow');
if (!reducedMotion && glow && window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${-y * 2.5}deg) rotateY(${x * 2.5}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

const nav = document.querySelector('.nav-shell');
let previousScroll = window.scrollY;
window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  nav.style.transform = currentScroll > previousScroll && currentScroll > 180 ? 'translateY(-100%)' : 'translateY(0)';
  previousScroll = currentScroll;
}, { passive: true });

const progressBar = document.querySelector('.scroll-progress span');
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const trackedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const updatePageChrome = () => {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollRange > 0 ? Math.min(window.scrollY / scrollRange, 1) : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;

  let currentId = trackedSections[0]?.id;
  trackedSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= window.innerHeight * 0.38) currentId = section.id;
  });
  navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`));
};

window.addEventListener('scroll', updatePageChrome, { passive: true });
window.addEventListener('resize', updatePageChrome, { passive: true });
updatePageChrome();

const toolMarquee = document.querySelector('.tool-marquee');
if (toolMarquee && !reducedMotion) {
  let dragging = false;
  let resumeAt = 0;
  let pointerStart = 0;
  let scrollStart = 0;
  let previousTime = performance.now();

  const ribbonWidth = () => toolMarquee.scrollWidth / 2;
  toolMarquee.scrollLeft = ribbonWidth() / 2;

  const animateRibbon = (time) => {
    const elapsed = Math.min(time - previousTime, 32);
    previousTime = time;
    if (!dragging && time > resumeAt) {
      toolMarquee.scrollLeft += elapsed * 0.025;
      if (toolMarquee.scrollLeft >= ribbonWidth()) toolMarquee.scrollLeft -= ribbonWidth();
      if (toolMarquee.scrollLeft <= 0) toolMarquee.scrollLeft += ribbonWidth();
    }
    requestAnimationFrame(animateRibbon);
  };

  toolMarquee.addEventListener('pointerdown', (event) => {
    dragging = true;
    pointerStart = event.clientX;
    scrollStart = toolMarquee.scrollLeft;
    toolMarquee.classList.add('dragging');
    toolMarquee.setPointerCapture(event.pointerId);
  });

  toolMarquee.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    toolMarquee.scrollLeft = scrollStart - (event.clientX - pointerStart);
  });

  const finishDrag = (event) => {
    if (!dragging) return;
    dragging = false;
    resumeAt = performance.now() + 1300;
    toolMarquee.classList.remove('dragging');
    if (toolMarquee.hasPointerCapture(event.pointerId)) toolMarquee.releasePointerCapture(event.pointerId);
    if (toolMarquee.scrollLeft >= ribbonWidth()) toolMarquee.scrollLeft -= ribbonWidth();
    if (toolMarquee.scrollLeft <= 0) toolMarquee.scrollLeft += ribbonWidth();
  };

  toolMarquee.addEventListener('pointerup', finishDrag);
  toolMarquee.addEventListener('pointercancel', finishDrag);
  requestAnimationFrame(animateRibbon);
}
