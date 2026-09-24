(function(){
  'use strict';
  var section=document.querySelector('.smart-energy');
  if(!section)return;
  var stage=section.querySelector('.smart-stage');
  var house=section.querySelector('.smart-house-wrap');
  var phones=section.querySelector('.smart-phones');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      entries.forEach(function(entry){if(entry.isIntersecting)entry.target.classList.add('is-visible');});
    },{threshold:.2}).observe(section);
  }else{section.classList.add('is-visible');}
  function reset(){
    if(house)house.style.transform='';
    if(phones)phones.style.transform='';
  }
  if(stage){
    stage.addEventListener('pointermove',function(e){
      if(reduce.matches||window.innerWidth<760)return;
      var r=stage.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5;
      var y=(e.clientY-r.top)/r.height-.5;
      if(house)house.style.transform='translate3d('+(x*-10)+'px,'+(y*-7)+'px,0) rotateY('+(x*2.2)+'deg) rotateX('+(y*-1.4)+'deg)';
      if(phones)phones.style.transform='translate3d('+(x*18)+'px,'+(y*14)+'px,24px) rotate('+(2+x*3)+'deg)';
    });
    stage.addEventListener('pointerleave',reset);
  }
  reduce.addEventListener('change',reset);
})();
