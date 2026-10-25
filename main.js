/* CAO website scripts – no dependencies */
(function(){
  'use strict';
  var d=document, w=window;
  var reduce=w.matchMedia&&w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return (c||d).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};

  var yr=$('#yr'); if(yr) yr.textContent=new Date().getFullYear();

  /* header, progress bar, back-to-top */
  var hd=$('.site-header'), bar=$('#progress'), top=$('#top');
  function onScroll(){
    var y=w.pageYOffset||d.documentElement.scrollTop, h=d.documentElement.scrollHeight-w.innerHeight;
    if(hd) hd.classList.toggle('scrolled',y>10);
    if(bar) bar.style.transform='scaleX('+(h>0?Math.min(y/h,1):0)+')';
    if(top) top.classList.toggle('show',y>700);
  }
  onScroll(); w.addEventListener('scroll',onScroll,{passive:true});
  if(top) top.addEventListener('click',function(){w.scrollTo({top:0,behavior:reduce?'auto':'smooth'})});

  /* mobile menu + dropdowns */
  var mb=$('.menu-btn'), nav=$('#nav');
  function closeMenu(){d.body.classList.remove('nav-open'); if(mb) mb.setAttribute('aria-expanded','false')}
  if(mb&&nav){
    mb.addEventListener('click',function(){var o=d.body.classList.toggle('nav-open'); mb.setAttribute('aria-expanded',o)});
    $$('a',nav).forEach(function(a){a.addEventListener('click',closeMenu)});
  }
  $$('.sub-btn').forEach(function(b){b.addEventListener('click',function(e){
    e.stopPropagation();
    var li=b.parentNode, o=!li.classList.contains('open');
    $$('.nav li.open').forEach(function(l){if(l!==li){l.classList.remove('open');$('.sub-btn',l).setAttribute('aria-expanded','false')}});
    li.classList.toggle('open',o); b.setAttribute('aria-expanded',o);
  })});
  d.addEventListener('click',function(){$$('.nav li.open').forEach(function(l){l.classList.remove('open')})});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){closeMenu();$$('.nav li.open').forEach(function(l){l.classList.remove('open')})}});

  /* scroll reveal with stagger */
  $$('.stagger').forEach(function(p){
    $$(':scope > .rv',p).forEach(function(c,i){c.style.transitionDelay=(i*90)+'ms'});
  });
  var rv=$$('.rv');
  if('IntersectionObserver' in w && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    rv.forEach(function(e){io.observe(e)});
  } else rv.forEach(function(e){e.classList.add('in')});

  /* counters */
  function runCount(el){
    var to=parseFloat(el.getAttribute('data-count')), dur=1500, t0=null;
    if(reduce){el.textContent=to;return}
    function step(t){
      if(!t0) t0=t; var p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3);
      el.textContent=Math.round(to*e); if(p<1) requestAnimationFrame(step); else el.textContent=to;
    }
    requestAnimationFrame(step);
  }
  var cs=$$('[data-count]');
  if('IntersectionObserver' in w){
    var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){runCount(e.target);io2.unobserve(e.target)}})},{threshold:.6});
    cs.forEach(function(c){io2.observe(c)});
  } else cs.forEach(function(c){c.textContent=c.getAttribute('data-count')});

  /* gentle parallax */
  var px=$$('[data-parallax]'), ticking=false;
  function par(){
    var vh=w.innerHeight;
    px.forEach(function(el){
      var r=el.parentNode.getBoundingClientRect(); if(r.bottom<-100||r.top>vh+100) return;
      var s=parseFloat(el.getAttribute('data-parallax'))||.1, c=(r.top+r.height/2-vh/2);
      el.style.transform='translate3d(0,'+(-c*s).toFixed(1)+'px,0)';
    }); ticking=false;
  }
  if(px.length&&!reduce){
    w.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(par)}},{passive:true});
    w.addEventListener('resize',par); par();
  }

  /* lightbox with prev/next, keys and swipe */
  var lb=$('#lb');
  if(lb&&lb.showModal){
    var items=$$('[data-lb]'), idx=0, img=$('#lb-img'), cap=$('#lb-cap');
    function show(i){
      idx=(i+items.length)%items.length; var b=items[idx];
      img.src=b.getAttribute('data-full'); img.alt=b.getAttribute('data-cap')||''; cap.textContent=b.getAttribute('data-cap')||'';
    }
    items.forEach(function(b,i){b.addEventListener('click',function(){show(i);lb.showModal()})});
    $('#lb-close').addEventListener('click',function(){lb.close()});
    $('#lb-prev').addEventListener('click',function(){show(idx-1)});
    $('#lb-next').addEventListener('click',function(){show(idx+1)});
    lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});
    lb.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(idx-1); if(e.key==='ArrowRight')show(idx+1)});
    var sx=null;
    lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){if(sx===null)return; var dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>50) show(idx+(dx<0?1:-1)); sx=null});
  }

})();
