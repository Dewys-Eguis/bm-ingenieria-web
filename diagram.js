(function () {
  'use strict';

  var diagram = document.querySelector('.sld');
  if (!diagram) return;

  var nodes = Array.from(diagram.querySelectorAll('.node'));
  var items = Array.from(diagram.querySelectorAll('.chain li'));
  var pause = diagram.querySelector('.diagram-pause');
  var nextButton = diagram.querySelector('.diagram-next');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var data = window.bmDiagramInfo || {};
  var current = Math.max(0, nodes.findIndex(function (node) { return node.getAttribute('aria-pressed') === 'true'; }));
  if (current < 0) current = 0;
  var visible = false;
  var paused = false;
  var autoTimer = null;

  var title = document.getElementById('sld-h');
  var desc = document.getElementById('sld-p');
  var link = document.getElementById('sld-a');
  var badge = document.getElementById('sld-badge');
  var step = document.getElementById('sld-step');
  var meterFill = document.getElementById('sld-meter-fill');
  var highlights = document.getElementById('sld-highlights');
  var stampNumber = diagram.querySelector('.stamp-number');
  var stampIcon = diagram.querySelector('.stamp-icon');

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function contentFor(node) {
    return data[node.dataset.k] || {};
  }

  function renderHighlights(list) {
    if (!highlights) return;
    highlights.innerHTML = '';
    (list || []).slice(0, 3).forEach(function (item) {
      var li = document.createElement('li');
      li.textContent = item;
      highlights.appendChild(li);
    });
  }

  function updateStamp(node, index) {
    if (stampNumber) stampNumber.textContent = pad(index + 1);
    if (stampIcon) {
      var svg = node.querySelector('svg');
      if (svg) stampIcon.replaceChildren(svg.cloneNode(true));
    }
  }

  function updateProgress(index) {
    if (step) step.textContent = pad(index + 1) + ' / ' + pad(nodes.length);
    if (meterFill) meterFill.style.width = ((index + 1) / nodes.length * 100) + '%';
  }

  function updateTrail(index) {
    items.forEach(function (item, itemIndex) {
      item.classList.toggle('is-past', itemIndex < index);
      item.classList.toggle('is-active', itemIndex === index);
      item.classList.toggle('is-future', itemIndex > index);
    });
  }

  function setActive(index, options) {
    if (index < 0) index = nodes.length - 1;
    if (index >= nodes.length) index = 0;
    current = index;

    nodes.forEach(function (node, nodeIndex) {
      node.setAttribute('aria-pressed', String(nodeIndex === index));
      node.setAttribute('tabindex', nodeIndex === index ? '0' : '-1');
    });

    var node = nodes[index];
    var info = contentFor(node);
    if (title) title.textContent = info.h || node.querySelector('.station-label').textContent;
    if (desc) desc.textContent = info.p || '';
    if (link && info.a) link.setAttribute('href', info.a);
    if (badge) badge.textContent = info.badge || 'Ingeniería del sistema';
    renderHighlights(info.bullets);
    updateStamp(node, index);
    updateProgress(index);
    updateTrail(index);

    if (options && options.focus) node.focus();
  }

  function autoplayEnabled() {
    return visible && !paused && !reduced.matches && !document.hidden;
  }

  function restartAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    if (autoplayEnabled()) {
      autoTimer = window.setInterval(function () {
        setActive((current + 1) % nodes.length);
      }, 4000);
    }
    sync();
  }

  function sync() {
    var running = autoplayEnabled();
    diagram.classList.toggle('diagram-running', running);
    if (pause) {
      pause.disabled = reduced.matches;
      pause.hidden = false;
      pause.setAttribute('aria-pressed', String(paused || reduced.matches));
      pause.setAttribute('aria-label', reduced.matches
        ? 'Recorrido automático desactivado por movimiento reducido'
        : paused
          ? 'Reanudar recorrido automático'
          : 'Pausar recorrido automático');
      if (pause.firstElementChild) pause.firstElementChild.textContent = paused || reduced.matches ? '▷' : 'Ⅱ';
      var label = pause.querySelector('.diagram-pause-label');
      if (label) label.textContent = paused || reduced.matches ? 'Auto' : 'Auto';
    }
  }

  nodes.forEach(function (node, index) {
    node.setAttribute('aria-controls', 'sld-h sld-p');
    node.addEventListener('click', function () {
      paused = true;
      setActive(index);
      restartAuto();
    });
    node.addEventListener('keydown', function (event) {
      var target;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % nodes.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index + nodes.length - 1) % nodes.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = nodes.length - 1;
      if (target !== undefined) {
        event.preventDefault();
        paused = true;
        setActive(target, { focus: true });
        restartAuto();
      }
    });
  });

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      paused = true;
      setActive((current + 1) % nodes.length);
      restartAuto();
    });
  }

  if (pause) {
    pause.addEventListener('click', function () {
      paused = !paused;
      restartAuto();
    });
  }

  reduced.addEventListener('change', restartAuto);
  document.addEventListener('visibilitychange', restartAuto);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0] ? entries[0].isIntersecting : false;
      restartAuto();
    }, { threshold: 0.35 }).observe(diagram);
  } else {
    visible = true;
  }

  setActive(current);
  restartAuto();
})();
