// script.js - Carousel + gallery rendering
document.addEventListener('DOMContentLoaded', ()=>{
  // --- Loader handling (unchanged) ---
  const loader = document.getElementById('loader-overlay');
  const loaderLogo = document.getElementById('loader-logo');
  if(loaderLogo){ loaderLogo.onerror = () => { try{ loaderLogo.src = '173 sin título_20260824012952.png'; }catch(e){} }; }
  const minDisplay = 2500; const maxFallback = 5000; const start = performance.now(); let hidden=false;
  function hideImmediate(){ if(!loader||hidden) return; hidden=true; loader.classList.add('hidden'); setTimeout(()=>{ if(loader) loader.style.display='none'; },480); }
  function hideAfterMin(){ if(!loader) return; const elapsed = performance.now()-start; const wait = Math.max(0, minDisplay-elapsed); setTimeout(hideImmediate, wait); }
  window.addEventListener('load', hideAfterMin); const fallback = setTimeout(()=>{ if(loader && !hidden) hideImmediate(); }, maxFallback);
  // --- Carousel ---
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
  function build(){ slides.forEach((s,i)=>{
      const slide = document.createElement('div'); slide.className='carousel-slide';
      const a=document.createElement('a'); a.href=s.link; a.target='_blank'; a.rel='noopener noreferrer';
      const img=document.createElement('img'); img.className='carousel-img'; img.src=s.img; img.alt=s.title; a.appendChild(img);
      slide.appendChild(a);
      const cap=document.createElement('div'); cap.className='carousel-caption'; cap.textContent=s.title; slide.appendChild(cap);
      track.appendChild(slide);
      const ind=document.createElement('button'); ind.addEventListener('click', ()=> goTo(i)); if(i===0) ind.classList.add('active'); indicators.appendChild(ind);
    });
  }
  function update(){ track.style.transform = `translateX(${-current*100}%)`; Array.from(indicators.children).forEach((b,idx)=> b.classList.toggle('active', idx===current)); }
  function next(){ current = (current+1)%slides.length; update(); }
  function prev(){ current = (current-1+slides.length)%slides.length; update(); }
  function goTo(i){ current = (i+slides.length)%slides.length; update(); }
  prevBtn.addEventListener('click', prev); nextBtn.addEventListener('click', next); document.addEventListener('keydown', (e)=>{ if(e.key==='ArrowRight') next(); if(e.key==='ArrowLeft') prev(); });
  build(); update();

  // --- Gallery: posters provided by user ---
  const posters = [
    { title: 'Engendro', img: 'https://image.tmdb.org/t/p/w500/cVQFWGIt5PNw3p7AcQOq2Eg39G.jpg', duration:'1h 52m', rating:'SP', formats:'2D' },
    { title: 'La invitación', img: 'https://image.tmdb.org/t/p/w500/21JnfyCARiRkms9AZHtTXiZKbIj.jpg', duration:'2h 02m', rating:'13', formats:'2D' },
    { title: 'Adolescencia, sexo y muerte en campamento Miasma', img: 'https://image.tmdb.org/t/p/w500/8UTCpwvHxWPllCJ7YnaCbffmYyD.jpg', duration:'1h 38m', rating:'SP', formats:'2D' },
    { title: 'Insaciable', img: 'https://image.tmdb.org/t/p/w500/v9st6lwP4K2i6YCa7kLQVQEuvNZ.jpg', duration:'1h 55m', rating:'G', formats:'3D' },
    { title: 'Tiempo de victoria', img: 'https://image.tmdb.org/t/p/w500/byKFPj2xvKkqMKQ4i0Ayq6N7Z9E.jpg', duration:'2h 20m', rating:'SP', formats:'2D · VO' },
    { title: 'El árbol muy muy lejano', img: 'https://image.tmdb.org/t/p/w500/udXvLxC5gAqN8SinemyFBEcHpTf.jpg', duration:'1h 50m', rating:'13', formats:'2D' },
    { title: 'Tóxico: Un cuento de hadas para adultos', img: 'https://image.tmdb.org/t/p/w500/bhpSB2g6yCKyxRgvgZ27KUgBHg6.jpg', duration:'1h 47m', rating:'R-17', formats:'2D' },
    { title: 'Nimrods: A Green Day Comedy', img: 'https://image.tmdb.org/t/p/w500/aebmSpFu1lUV78PtOpqMUn4d82B.jpg', duration:'1h 28m', rating:'G', formats:'2D' },
    { title: 'Esa cosa con alas', img: 'https://image.tmdb.org/t/p/w500/aaoS7XEWnKeQCa3EqWAXC803hlg.jpg', duration:'1h 40m', rating:'SP', formats:'2D' },
    { title: 'Yo, narciso', img: 'https://image.tmdb.org/t/p/w500/3qe9gaT7jpKVJJ6UtM9Pr5jm3Hq.jpg', duration:'2h 05m', rating:'G', formats:'2D' },
    { title: 'Canelones', img: 'https://image.tmdb.org/t/p/w500/s2g8wLNs6G5XYa5ivfUNuWbQTKQ.jpg', duration:'1h 30m', rating:'SP', formats:'2D' }
  ];

  const grid = document.getElementById('gallery-grid');
  function renderGallery(){ grid.innerHTML = '';
    posters.forEach(p=>{
      const card=document.createElement('article'); card.className='card';
      const wrap=document.createElement('div'); wrap.className='poster-wrap';
      const img=document.createElement('img'); img.className='poster'; img.src=p.img; img.alt=p.title; wrap.appendChild(img);
      const dur=document.createElement('div'); dur.className='duration'; dur.textContent=p.duration; wrap.appendChild(dur);
      const smile=document.createElement('div'); smile.className='smile'; smile.textContent='☺'; wrap.appendChild(smile);
      card.appendChild(wrap);
      const body=document.createElement('div'); body.className='card-body';
      const title=document.createElement('h3'); title.className='card-title'; title.textContent=p.title; body.appendChild(title);
      const rating=document.createElement('span'); rating.className='rating'; rating.textContent=p.rating; title.appendChild(rating);
      const formats=document.createElement('div'); formats.className='formats'; formats.textContent=p.formats; body.appendChild(formats);
      if(p.premiere){ const pm=document.createElement('div'); pm.className='premiere'; pm.textContent='Estreno'; card.appendChild(pm); }
      // open detail on click
      card.addEventListener('click', ()=> window.open(p.img, '_blank'));
      grid.appendChild(card);
    });
  }
  renderGallery();
});
