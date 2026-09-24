(function(){
  'use strict';
  /* Evita pequeños saltos al entrar con un hash y mantiene el primer frame estable. */
  document.documentElement.classList.add('flow-ready');
  var hash=window.location.hash;
  if(hash){
    var target=document.querySelector(hash);
    if(target){
      window.requestAnimationFrame(function(){ target.scrollIntoView({block:'start'}); });
    }
  }
})();
