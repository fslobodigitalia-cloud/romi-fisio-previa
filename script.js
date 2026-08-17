// Preencher com o número real no formato internacional, ex: "5511999999999"
const WHATSAPP_NUMBER = "";

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Hero video: respect reduced motion, pause when off-screen ----------
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    if (reduceMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    } else {
      const videoIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) heroVideo.play().catch(() => {});
          else heroVideo.pause();
        });
      }, { threshold: 0.1 });
      videoIO.observe(heroVideo);
    }
  }

  // ---------- Header scroll state ----------
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Mobile menu ----------
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');

  const setMenu = (isActive) => {
    menuToggle.classList.toggle('active', isActive);
    mobileNav.classList.toggle('active', isActive);
    // o painel aberto é escuro: o header precisa voltar ao estado claro
    header.classList.toggle('menu-open', isActive);
    menuToggle.setAttribute('aria-expanded', String(isActive));
    document.body.style.overflow = isActive ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', () => setMenu(!mobileNav.classList.contains('active')));
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) setMenu(false);
  });

  // ---------- Scrollspy: marca a seção visível na navegação ----------
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }

  // ---------- Smooth scroll with fixed-header offset ----------
  const getHeaderOffset = () => header.offsetHeight + 16;
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // ---------- Scroll reveal (with stagger inside [data-stagger] groups) ----------
  const staggerGroups = document.querySelectorAll('[data-stagger]');
  staggerGroups.forEach(group => {
    const items = group.querySelectorAll(':scope > .reveal, :scope > .reveal--pop');
    items.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
    });
  });

  const revealEls = document.querySelectorAll('.reveal, .reveal--pop, .method-step');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // ---------- Accordion ----------
  document.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.accordion-item').forEach(other => {
        other.classList.remove('active');
        other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
        other.querySelector('.accordion-panel').style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Schedule form -> WhatsApp ----------
  const form = document.getElementById('scheduleForm');
  const formNote = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      formNote.textContent = 'Preencha nome e WhatsApp para continuar.';
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const nome = (data.get('nome') || '').toString().trim();
    const whatsapp = (data.get('whatsapp') || '').toString().trim();
    const tratamento = data.get('tratamento') || '';
    const tempo = data.get('tempo') || '';
    const objetivo = data.get('objetivo') || '';

    const text = `Olá, Dr. Romi! Meu nome é ${nome}.\n\n`
      + `WhatsApp: ${whatsapp}\n`
      + `O que gostaria de tratar: ${tratamento}\n`
      + `Há quanto tempo sente o problema: ${tempo}\n`
      + `Objetivo principal: ${objetivo}\n\n`
      + `Gostaria de agendar uma avaliação.`;

    if (!WHATSAPP_NUMBER) {
      formNote.textContent = 'Prévia: número do WhatsApp será configurado após aprovação.';
      return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  });

});
