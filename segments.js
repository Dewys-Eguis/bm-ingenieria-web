(function () {
  'use strict';
  var section = document.querySelector('.audience-network');
  if (!section) return;
  var consolePanel = section.querySelector('.network-console');
  var toggle = section.querySelector('.network-motion-toggle');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var paused = false;
  var visible = false;
  function syncMotion() {
    consolePanel.classList.toggle('network-running', visible && !paused && !reduced.matches && !document.hidden);
    toggle.disabled = reduced.matches;
    toggle.setAttribute('aria-pressed', String(paused || reduced.matches));
    toggle.setAttribute('aria-label', reduced.matches ? 'Animación desactivada por preferencia de movimiento reducido' : paused ? 'Reanudar animación del gráfico' : 'Pausar animación del gráfico');
    toggle.firstElementChild.textContent = paused || reduced.matches ? '▷' : 'Ⅱ';
  }
  toggle.hidden = false;
  toggle.addEventListener('click', function () { paused = !paused; syncMotion(); });
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; syncMotion(); }, { threshold: 0 });
    observer.observe(consolePanel);
  }
  function highlight(sector) {
    consolePanel.classList.toggle('is-highlighting', sector !== null);
    consolePanel.querySelectorAll('[data-sector]').forEach(function (element) { element.classList.toggle('is-highlighted', element.dataset.sector === sector); });
  }
  section.querySelectorAll('.audience-row').forEach(function (row) {
    row.addEventListener('pointerenter', function () { highlight(row.dataset.sector); });
    row.addEventListener('pointerleave', function () { var focused = section.querySelector('.audience-row:focus-within'); highlight(focused ? focused.dataset.sector : null); });
    row.addEventListener('focusin', function () { highlight(row.dataset.sector); });
    row.addEventListener('focusout', function (event) { if (!row.contains(event.relatedTarget)) highlight(null); });
  });
  syncMotion();
})();
