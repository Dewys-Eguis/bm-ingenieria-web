(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var observed = [];
  var counters = [];
  var activeAnimations = new Map();
  function animate(element, frames, options) {
    if (activeAnimations.has(element)) activeAnimations.get(element).cancel();
    if (reduced.matches || !element.animate) return;
    var animation = element.animate(frames, options);
    activeAnimations.set(element, animation);
    animation.onfinish = function () { activeAnimations.delete(element); };
    return animation;
  }

  // Content is visible by default. Only a working observer opts into reveals.
  var observer = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      if (entry.target.matches('.steps')) entry.target.classList.add('process-started');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 }) : null;
  function reveal(selector, type, stagger) {
    document.querySelectorAll(selector).forEach(function (element, index) {
      element.dataset.reveal = type;
      if (!observer || reduced.matches) return;
      element.style.setProperty('--reveal-delay', (index % (stagger || 1)) * 75 + 'ms');
      element.classList.add('reveal-pending');
      observed.push(element);
      observer.observe(element);
    });
  }
  reveal('.hero-grid > div:first-child', 'up');
  reveal('.hero-visual', 'zoom');
  reveal('.sld', 'up');
  reveal('.figures dl > div', 'up', 5);
  reveal('.about-visual', 'left');
  reveal('.about-grid > div:last-child', 'right');
  reveal('.services-head, .segments > .wrap > h2, #proceso h2, .projects h2, .clients h2', 'up');
  reveal('.service-picker', 'left');
  reveal('.service-stage', 'right');
  reveal('.audience-heading', 'up');
  reveal('.network-console', 'zoom');
  reveal('.audience-row', 'up', 4);
  reveal('.calc > div:first-child', 'left');
  reveal('.calc .panel', 'right');
  reveal('.sheet', 'up', 3);
  reveal('.logo-wall li', 'zoom', 3);
  reveal('.gear > div', 'up', 3);
  reveal('.contact-grid > div', 'left');
  reveal('.contact form', 'right');
  var steps = document.querySelector('.steps');
  steps.querySelectorAll('li').forEach(function (step, index) { step.style.setProperty('--step-index', index); });
  if (observer && !reduced.matches) {
    steps.classList.add('process-waiting');
    observer.observe(steps);
    reveal('.steps li', 'up', 5);
  }
  document.addEventListener('focusin', function (event) {
    var element = event.target.closest('.reveal-pending');
    if (element) element.classList.add('is-visible');
  });

  // Original figures remain the accessible labels; interpolation is decorative.
  var numberFormat = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
  var specifications = [
    { value: 130, format: function (n) { return '+' + numberFormat.format(Math.round(n)); } },
    { value: 2600, format: function (n) { return '+' + numberFormat.format(Math.round(n)); } },
    { value: 15000, format: function (n) { return '+' + numberFormat.format(Math.round(n)) + ' MM COP'; } },
    { value: 5, format: function (n) { return '+' + Math.round(n) + ' MWp'; } },
    { value: 1.6, format: function (n) { return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' MWp'; } }
  ];
  document.querySelectorAll('.figures dt').forEach(function (element, index) {
    var original = element.textContent;
    var text = document.createElement('span');
    text.textContent = original;
    text.setAttribute('aria-hidden', 'true');
    element.setAttribute('aria-label', original);
    element.replaceChildren(text);
    counters.push({ element: element, text: text, original: original, spec: specifications[index], frame: 0, done: false });
  });
  function finishCounter(counter) {
    cancelAnimationFrame(counter.frame);
    counter.text.textContent = counter.original;
    counter.done = true;
  }
  function count(counter) {
    if (counter.done) return;
    if (reduced.matches) { finishCounter(counter); return; }
    counter.done = true;
    var start;
    function frame(time) {
      if (start === undefined) start = time;
      var progress = Math.min((time - start) / 1300, 1);
      counter.text.textContent = counter.spec.format(counter.spec.value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) counter.frame = requestAnimationFrame(frame);
      else finishCounter(counter);
    }
    counter.frame = requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counters.forEach(function (counter) { if (counter.element === entry.target) count(counter); });
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (counter) { countObserver.observe(counter.element); });
  }

  document.querySelectorAll('.node').forEach(function (node) {
    node.addEventListener('click', function () {
      animate(document.querySelector('.sld-detail'), [{ opacity: 0.45, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
    });
  });
  // Animate the result cards, never the calculation or its accessible values.
  function refreshResults() {
    document.querySelectorAll('.result > div').forEach(function (card, index) {
      animate(card, [{ opacity: 0.65, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, delay: index * 20, easing: 'ease-out' });
    });
  }
  document.getElementById('kwh').addEventListener('input', refreshResults);
  document.getElementById('tarifa').addEventListener('input', refreshResults);

  // Avoid continuous decorative work outside the viewport or in background tabs.
  if ('IntersectionObserver' in window) {
    var activityObserver = new IntersectionObserver(function (entries) { entries.forEach(function (entry) { entry.target.classList.toggle('motion-in-view', entry.isIntersecting); }); });
    activityObserver.observe(document.querySelector('.hero'));
  }
  document.addEventListener('visibilitychange', function () {
    document.documentElement.classList.toggle('motion-paused', document.hidden);
    if (document.hidden) counters.forEach(function (counter) { if (counter.done) finishCounter(counter); });
  });
  reduced.addEventListener('change', function () {
    if (!reduced.matches) return;
    observed.forEach(function (element) { element.classList.add('is-visible'); });
    if (observer) observer.disconnect();
    steps.classList.remove('process-waiting');
    counters.forEach(finishCounter);
    activeAnimations.forEach(function (animation) { animation.cancel(); });
    activeAnimations.clear();
  });
})();
