(function () {
  'use strict';
  var browser = document.querySelector('.service-browser');
  if (!browser) return;
  var tabs = Array.from(browser.querySelectorAll('.service-card'));
  var panels = Array.from(browser.querySelectorAll('.service-panel'));
  var list = browser.querySelector('.service-tabs');
  var mobile = window.matchMedia('(max-width: 900px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var previous = browser.querySelector('.service-prev');
  var next = browser.querySelector('.service-next');
  var position = browser.querySelector('.service-position');
  var active = -1;
  var animation;
  browser.classList.add('is-enhanced');
  list.setAttribute('role', 'tablist');
  tabs.forEach(function (tab, index) {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
  });
  function align(index) {
    if (!mobile.matches) return;
    list.scrollTo({ left: list.scrollLeft + tabs[index].getBoundingClientRect().left - list.getBoundingClientRect().left - 5, behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  function select(index, options) {
    options = options || {};
    if (index < 0 || index >= tabs.length) return;
    var changed = active !== index;
    if (changed && animation) { animation.cancel(); animation = null; }
    active = index;
    tabs.forEach(function (tab, i) {
      var selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].classList.toggle('is-active', selected);
      panels[i].setAttribute('aria-hidden', String(!selected));
      panels[i].inert = !selected;
    });
    previous.disabled = index === 0;
    next.disabled = index === tabs.length - 1;
    position.textContent = String(index + 1).padStart(2, '0') + ' / 07';
    if (changed && !options.instant && !reduced.matches && panels[index].animate) {
      animation = panels[index].animate([{ opacity: 0.45, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
    if (options.align) align(index);
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { select(index, { align: true }); });
    // Manual tabs: pointer movement and keyboard focus never replace the reading panel.
    // Enter and Space activate the native button through its click event.
    tab.addEventListener('keydown', function (event) {
      var target;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target === undefined) return;
      event.preventDefault();
      tabs.forEach(function (item, i) { item.tabIndex = i === target ? 0 : -1; });
      tabs[target].focus({ preventScroll: true });
      align(target);
    });
  });
  previous.addEventListener('click', function () { select(active - 1, { align: true }); });
  next.addEventListener('click', function () { select(active + 1, { align: true }); });
  // Swiping browses the cards; only tapping a card or a carousel arrow changes the panel.
  function activateHash(hash, focus) {
    var index = panels.findIndex(function (panel) { return '#' + panel.id === hash; });
    if (index < 0) return false;
    select(index, { instant: true, align: true });
    browser.querySelectorAll('.reveal-pending').forEach(function (element) { element.classList.add('is-visible'); });
    if (focus) panels[index].focus({ preventScroll: true });
    return true;
  }
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#svc-"]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (activateHash(link.hash, true)) {
      // Also scroll when the same fragment is selected again.
      document.getElementById(link.hash.slice(1)).scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    }
  });
  window.addEventListener('hashchange', function () { activateHash(location.hash, false); });
  mobile.addEventListener('change', function () { align(active); });
  reduced.addEventListener('change', function () { if (reduced.matches && animation) animation.cancel(); });
  select(0, { instant: true });
  if (activateHash(location.hash, false)) requestAnimationFrame(function () { document.getElementById(location.hash.slice(1)).scrollIntoView({ block: 'start', behavior: 'instant' }); });
})();

