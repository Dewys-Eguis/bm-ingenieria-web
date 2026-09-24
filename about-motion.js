(function () {
  'use strict';
  var section = document.querySelector('.about');
  if (!section) return;
  var toggle = section.querySelector('.about-motion-toggle');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var paused = false;
  var visible = false;
  function sync() {
    section.classList.toggle('about-running', visible && !paused && !reduced.matches && !document.hidden);
    toggle.disabled = reduced.matches;
    toggle.setAttribute('aria-pressed', String(paused || reduced.matches));
    toggle.setAttribute('aria-label', reduced.matches ? 'Animación desactivada por preferencia de movimiento reducido' : paused ? 'Reanudar animación del plano' : 'Pausar animación del plano');
    toggle.firstElementChild.textContent = paused || reduced.matches ? '▷' : 'Ⅱ';
  }
  toggle.hidden = false;
  toggle.addEventListener('click', function () { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !reduced.matches) section.classList.add('is-drafted');
      sync();
    }, { threshold: 0.05 });
    observer.observe(section);
  }
  sync();
})();
