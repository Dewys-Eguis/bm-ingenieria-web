(function(){
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var steps = document.querySelector('.steps');
  var process = document.getElementById('proceso');
  if (steps && process) {
    var spark = document.createElement('span');
    spark.className = 'process-spark';
    spark.setAttribute('aria-hidden','true');
    steps.appendChild(spark);
    var stepItems = Array.prototype.slice.call(steps.querySelectorAll('li'));
    function updateProcess(){
      if (reduced.matches) {
        steps.style.setProperty('--process-progress','1');
        stepItems.forEach(function(item){ item.classList.add('is-powered'); });
        return;
      }
      var rect = process.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var start = vh * 0.72;
      var end = -rect.height * 0.15;
      var progress = (start - rect.top) / (start - end);
      progress = Math.max(0, Math.min(1, progress));
      steps.style.setProperty('--process-progress', progress.toFixed(3));
      stepItems.forEach(function(item,index){
        var threshold = index / Math.max(1, stepItems.length - 1);
        item.classList.toggle('is-powered', progress + 0.035 >= threshold);
      });
    }
    var scheduled = false;
    function requestUpdate(){
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function(){ scheduled=false; updateProcess(); });
    }
    window.addEventListener('scroll',requestUpdate,{passive:true});
    window.addEventListener('resize',requestUpdate);
    updateProcess();
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
