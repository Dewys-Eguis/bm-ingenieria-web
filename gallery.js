(function(){
  'use strict';
  var carousel=document.querySelector('.gallery-carousel');
  if(!carousel) return;

  var track=carousel.querySelector('.gallery-track');
  var slides=Array.from(carousel.querySelectorAll('.gallery-slide'));
  var thumbs=Array.from(carousel.querySelectorAll('.gallery-thumb'));
  var prev=carousel.querySelector('.gallery-prev');
  var next=carousel.querySelector('.gallery-next');
  var currentEl=carousel.querySelector('[data-gallery-current]');
  var totalEl=carousel.querySelector('.gallery-count span');
  var progress=carousel.querySelector('.gallery-progress span');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var active=0;
  var timer=null;
  var hovering=false;
  var startX=0;

  if(totalEl) totalEl.textContent='/ '+String(slides.length).padStart(2,'0');

  function render(index,user){
    active=(index+slides.length)%slides.length;
    track.style.transform='translate3d(-'+(active*100)+'%,0,0)';
    slides.forEach(function(slide,i){
      slide.classList.toggle('is-active',i===active);
      slide.setAttribute('aria-hidden',String(i!==active));
    });
    thumbs.forEach(function(thumb,i){
      thumb.classList.toggle('is-active',i===active);
      thumb.setAttribute('aria-pressed',String(i===active));
    });
    if(currentEl) currentEl.textContent=String(active+1).padStart(2,'0');
    if(progress) progress.style.transform='scaleX('+((active+1)/slides.length)+')';
    if(user) restart();
  }

  function step(delta,user){render(active+delta,user);}
  function restart(){
    if(timer){clearInterval(timer);timer=null;}
    if(!reduced&&!hovering&&!document.hidden){timer=setInterval(function(){step(1,false);},5600);}
  }

  if(prev) prev.addEventListener('click',function(){step(-1,true);});
  if(next) next.addEventListener('click',function(){step(1,true);});
  thumbs.forEach(function(thumb,i){thumb.addEventListener('click',function(){render(i,true);});});
  carousel.addEventListener('mouseenter',function(){hovering=true;restart();});
  carousel.addEventListener('mouseleave',function(){hovering=false;restart();});
  document.addEventListener('visibilitychange',restart);

  carousel.addEventListener('touchstart',function(e){startX=e.touches[0].clientX;},{passive:true});
  carousel.addEventListener('touchend',function(e){
    var dx=e.changedTouches[0].clientX-startX;
    if(Math.abs(dx)>45) step(dx<0?1:-1,true);
  },{passive:true});

  carousel.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'){e.preventDefault();step(-1,true);}
    if(e.key==='ArrowRight'){e.preventDefault();step(1,true);}
  });

  render(0,false);
  restart();
})();
