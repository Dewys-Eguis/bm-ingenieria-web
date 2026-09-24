// Presentation only. Calculator and WhatsApp logic remain in index.html.
(function () {
  'use strict';
  var header = document.querySelector('.top');
  var menu = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-nav');
  function scrollState() { header.classList.toggle('is-scrolled', window.scrollY > 16); }
  window.addEventListener('scroll', scrollState, { passive: true });
  scrollState();
  function closeMenu() {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menú');
  }
  menu.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.addEventListener('click', function (event) { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); } });
  window.matchMedia('(min-width: 861px)').addEventListener('change', closeMenu);
  var range = document.getElementById('kwh');
  function paintRange() {
    var percent = (range.value - range.min) / (range.max - range.min) * 100;
    range.style.setProperty('--progress', percent + '%');
  }
  range.addEventListener('input', paintRange);
  paintRange();
})();
