(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var steps = document.querySelector('.steps');
  var process = document.getElementById('proceso');
  if (steps && process) {
    var stepItems = Array.prototype.slice.call(steps.querySelectorAll('li'));
    var processFrame = 0;
    var processStarted = false;
    var processObserver;
    function paintProcess(progress){
      steps.style.setProperty('--process-progress', progress.toFixed(3));
      stepItems.forEach(function(item,index){
        var threshold = index / Math.max(1, stepItems.length - 1);
        item.classList.toggle('is-powered', progress >= threshold);
      });
    }
    function finishProcess(){
      processStarted = true;
      cancelAnimationFrame(processFrame);
      if (processObserver) processObserver.disconnect();
      paintProcess(1);
    }
    function startProcess(){
      if (processStarted) return;
      processStarted = true;
      if (processObserver) processObserver.disconnect();
      var startedAt;
      function frame(now){
        if (startedAt === undefined) startedAt = now;
        var progress = Math.min((now - startedAt) / 1800, 1);
        paintProcess(progress);
        if (progress < 1) processFrame = requestAnimationFrame(frame);
      }
      processFrame = requestAnimationFrame(frame);
    }
    if (reduced.matches || !('IntersectionObserver' in window)) {
      finishProcess();
    } else {
      processObserver = new IntersectionObserver(function(entries){
        if (entries.some(function(entry){ return entry.isIntersecting; })) startProcess();
      }, { threshold: 0.05 });
      processObserver.observe(steps);
    }
    reduced.addEventListener('change',function(){ if (reduced.matches) finishProcess(); });
    document.addEventListener('visibilitychange',function(){
      if (document.hidden && processStarted) finishProcess();
    });
  }

  var logoCards = document.querySelectorAll('.logo-wall li');
  logoCards.forEach(function(card){
    card.addEventListener('pointermove',function(e){
      if (reduced.matches || window.matchMedia('(max-width: 760px)').matches) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX-r.left)/r.width;
      var y = (e.clientY-r.top)/r.height;
      card.style.setProperty('--mx',(x*100).toFixed(1)+'%');
      card.style.setProperty('--my',(y*100).toFixed(1)+'%');
      card.style.setProperty('--ry',((x-.5)*5).toFixed(2)+'deg');
      card.style.setProperty('--rx',((.5-y)*4).toFixed(2)+'deg');
    });
    card.addEventListener('pointerleave',function(){
      card.style.setProperty('--mx','50%');card.style.setProperty('--my','50%');
      card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');
    });
  });
})();
