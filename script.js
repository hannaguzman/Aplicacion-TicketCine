// script.js - Simple carousel and loader logic
document.addEventListener('DOMContentLoaded', ()=>{
  // --- Loader handling: show for a few seconds with fade ---
  const loader = document.getElementById('loader-overlay');
  const loaderLogo = document.getElementById('loader-logo');
  // attempt fallback if local logo missing
  if(loaderLogo){
    loaderLogo.onerror = () => {
      // fallback to a bundled filename if present
      try{ loaderLogo.src = '173 sin título_20260824012952.png'; }catch(e){}
    };
  }

  const minDisplay = 2500; // ms to show loader minimum
  const maxFallback = 5000; // max fallback hide
  const start = performance.now();
  let hidden = false;

  function hideImmediate(){
    if(!loader || hidden) return;
    hidden = true;
    loader.classList.add('hidden');
    setTimeout(()=>{ if(loader) loader.style.display = 'none'; }, 480);
    if(fallback) clearTimeout(fallback);
  }

  function hideAfterMin(){
    if(!loader) return;
    const elapsed = performance.now() - start;
    const wait = Math.max(0, minDisplay - elapsed);
    setTimeout(hideImmediate, wait);
  }

  window.addEventListener('load', hideAfterMin);
  const fallback = setTimeout(()=>{ if(loader && !hidden) hideImmediate(); }, maxFallback);
  // --- End loader ---

  // --- Carousel data and logic ---
  const slides = [
    { title: 'Spider-Man: Brand New Day', img: 'https://image.tmdb.org/t/p/w500/9g0sEFhmvmK4nGhXj8DHuv2noYI.jpg', link: 'https://image.tmdb.org/t/p/w500/9g0sEFhmvmK4nGhXj8DHuv2noYI.jpg' },
    { title: 'La Odisea', img: 'https://image.tmdb.org/t/p/w500/9aeb5U0saB7Tuu0QITaoENZBxFF.jpg', link: 'https://image.tmdb.org/t/p/w500/9aeb5U0saB7Tuu0QITaoENZBxFF.jpg' },
    { title: 'La muerte de Robin Hood', img: 'https://image.tmdb.org/t/p/w500/pC2hVl4J522GcMVc5OghRHSs0tq.jpg', link: 'https://image.tmdb.org/t/p/w500/pC2hVl4J522GcMVc5OghRHSs0tq.jpg' },
    { title: 'Backrooms', img: 'https://image.tmdb.org/t/p/w500/ur2yYTVGPkEDmLdoQ1Obm2RKXuU.jpg', link: 'https://image.tmdb.org/t/p/w500/ur2yYTVGPkEDmLdoQ1Obm2RKXuU.jpg' },
    { title: 'El final de Oak Street', img: 'https://image.tmdb.org/t/p/w500/g9DUGw8ufetrwhCIrwq3h1NlpWO.jpg', link: 'https://image.tmdb.org/t/p/w500/g9DUGw8ufetrwhCIrwq3h1NlpWO.jpg' }
  ];

  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const indicators = document.getElementById('carousel-indicators');
  let current = 0;

  function build(){
    slides.forEach((s, i)=>{
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const a = document.createElement('a'); a.href = s.link; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const img = document.createElement('img'); img.className = 'carousel-img'; img.src = s.img; img.alt = s.title; a.appendChild(img);
      slide.appendChild(a);
      const cap = document.createElement('div'); cap.className = 'carousel-caption'; cap.textContent = s.title; slide.appendChild(cap);
      track.appendChild(slide);

      const ind = document.createElement('button'); ind.addEventListener('click', ()=> goTo(i)); if(i===0) ind.classList.add('active'); indicators.appendChild(ind);
    });
  }

  function update(){
    track.style.transform = `translateX(${-current*100}%)`;
    Array.from(indicators.children).forEach((b, idx)=> b.classList.toggle('active', idx===current));
  }

  function next(){ current = (current+1) % slides.length; update(); }
  function prev(){ current = (current-1 + slides.length) % slides.length; update(); }
  function goTo(i){ current = (i + slides.length) % slides.length; update(); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'ArrowRight') next(); if(e.key === 'ArrowLeft') prev(); });

  build(); update();
});
