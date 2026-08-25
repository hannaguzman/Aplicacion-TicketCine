// script.js - Simple carousel (one slide at a time) using provided TMDb images
document.addEventListener('DOMContentLoaded', ()=>{
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
  let currentIndex = 0;

  function build(){
    slides.forEach((s, i)=>{
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';

      const a = document.createElement('a');
      a.href = s.link; a.target = '_blank'; a.rel = 'noopener noreferrer';

      const img = document.createElement('img');
      img.className = 'carousel-img'; img.src = s.img; img.alt = s.title;

      a.appendChild(img);
      slide.appendChild(a);

      const cap = document.createElement('div'); cap.className = 'carousel-caption'; cap.textContent = s.title;
      slide.appendChild(cap);

      track.appendChild(slide);

      const ind = document.createElement('button');
      ind.addEventListener('click', ()=> goTo(i));
      if(i===0) ind.classList.add('active');
      indicators.appendChild(ind);
    });
  }

  function update(){
    track.style.transform = `translateX(${-currentIndex*100}%)`;
    Array.from(indicators.children).forEach((b, idx)=> b.classList.toggle('active', idx===currentIndex));
  }

  function next(){ currentIndex = (currentIndex+1) % slides.length; update(); }
  function prev(){ currentIndex = (currentIndex-1 + slides.length) % slides.length; update(); }
  function goTo(i){ currentIndex = (i + slides.length) % slides.length; update(); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  document.addEventListener('keydown', (e)=>{ if(e.key === 'ArrowRight') next(); if(e.key === 'ArrowLeft') prev(); });

  build(); update();
});
