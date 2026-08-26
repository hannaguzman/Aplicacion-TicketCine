// script.js - Carousel + cartelera gallery & embedded trailer player

document.addEventListener('DOMContentLoaded', ()=>{
  // --- Loader quick hide ---
  const loader = document.getElementById('loader-overlay');
  const loaderLogo = document.getElementById('loader-logo');
  if(loaderLogo){ loaderLogo.onerror = () => { try{ loaderLogo.src = '173 sin título_20260824012952.png'; }catch(e){} }; }
  const minDisplay = 120; const maxFallback = 800; const start = performance.now(); let hidden=false;
  function hideImmediate(){ if(!loader || hidden) return; hidden=true; loader.classList.add('hidden'); setTimeout(()=>{ if(loader) loader.style.display='none'; },240); }
  function hideAfterMin(){ if(!loader) return; const elapsed = performance.now()-start; const wait = Math.max(0, minDisplay-elapsed); setTimeout(hideImmediate, wait); }
  hideAfterMin(); const fallback = setTimeout(()=>{ if(loader && !hidden) hideImmediate(); }, maxFallback);

  // --- Carousel ---
  const slides = [
    { id: 'spiderman', title: 'Spider-Man: Brand New Day', img: 'https://image.tmdb.org/t/p/w500/9g0sEFhmvmK4nGhXj8DHuv2noYI.jpg', trailerId: 'QXibcL7-XbU' },
    { id: 'la-odisea', title: 'La Odisea', img: 'https://image.tmdb.org/t/p/w500/9aeb5U0saB7Tuu0QITaoENZBxFF.jpg', trailerId: '07DAunCV3Mw' },
    { id: 'robin-hood', title: 'La muerte de Robin Hood', img: 'https://image.tmdb.org/t/p/w500/pC2hVl4J522GcMVc5OghRHSs0tq.jpg', trailerId: 'CE-B1PSgsnA' },
    { id: 'backrooms', title: 'Backrooms', img: 'https://image.tmdb.org/t/p/w500/ur2yYTVGPkEDmLdoQ1Obm2RKXuU.jpg', trailerId: '-pqmvEa0aMk' },
    { id: 'oak-street', title: 'El final de Oak Street', img: 'https://image.tmdb.org/t/p/w500/g9DUGw8ufetrwhCIrwq3h1NlpWO.jpg', trailerId: 'EgkanoSZR44' }
  ];

  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const indicators = document.getElementById('carousel-indicators');
  let current = 0;

  function buildCarousel(){
    slides.forEach((s,i)=>{
      const slide = document.createElement('div'); slide.className='carousel-slide';
      const a = document.createElement('a'); a.href = s.img; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const img = document.createElement('img'); img.className = 'carousel-img'; img.src = s.img; img.alt = s.title; a.appendChild(img);
      slide.appendChild(a);
      const cap = document.createElement('div'); cap.className = 'carousel-caption'; cap.textContent = s.title; slide.appendChild(cap);
      track.appendChild(slide);

      const ind = document.createElement('button'); ind.addEventListener('click', ()=> goTo(i)); if(i===0) ind.classList.add('active'); indicators.appendChild(ind);
    });
  }

  function updateCarousel(){ track.style.transform = `translateX(${-current*100}%)`; Array.from(indicators.children).forEach((b,idx)=> b.classList.toggle('active', idx===current)); }
  function next(){ current = (current+1) % slides.length; updateCarousel(); }
  function prev(){ current = (current-1 + slides.length) % slides.length; updateCarousel(); }
  function goTo(i){ current = (i + slides.length) % slides.length; updateCarousel(); }
  prevBtn.addEventListener('click', prev); nextBtn.addEventListener('click', next); document.addEventListener('keydown', (e)=>{ if(e.key === 'ArrowRight') next(); if(e.key === 'ArrowLeft') prev(); });
  buildCarousel(); updateCarousel();

  // --- Cartelera gallery with trailers and schedules ---
  const posters = [
    { id: 'engendro', title: 'Engendro', img: 'https://image.tmdb.org/t/p/w500/cVQFWGIt5PNw3p7AcQOq2Eg39G.jpg', trailerId: 'gelyoVzunGw', schedules: ['10:00','13:30','16:00','19:30','22:10'], rating:'SP', formats:'2D' },
    { id: 'invitacion', title: 'La invitación', img: 'https://image.tmdb.org/t/p/w500/21JnfyCARiRkms9AZHtTXiZKbIj.jpg', trailerId: 'G7Bo0yV2Xvw', schedules: ['11:00','14:15','17:00','20:00'], rating:'13', formats:'2D' },
    { id: 'miasma', title: 'Adolescencia, sexo y muerte en campamento Miasma', img: 'https://image.tmdb.org/t/p/w500/8UTCpwvHxWPllCJ7YnaCbffmYyD.jpg', trailerId: 'In4T87vp2xA', schedules: ['09:45','12:30','15:50','18:40','21:30'], rating:'SP', formats:'2D' },
    { id: 'insaciable', title: 'Insaciable', img: 'https://image.tmdb.org/t/p/w500/v9st6lwP4K2i6YCa7kLQVQEuvNZ.jpg', trailerId: 'zIVcNrO-ZFE', schedules: ['10:30','13:00','16:30','19:00'], rating:'G', formats:'3D' },
    { id: 'victoria', title: 'Tiempo de victoria', img: 'https://image.tmdb.org/t/p/w500/byKFPj2xvKkqMKQ4i0Ayq6N7Z9E.jpg', trailerId: 'xIkH-xUVLbk', schedules: ['11:30','14:45','18:00','21:15'], rating:'SP', formats:'2D · VO' },
    { id: 'arbol', title: 'El árbol muy muy lejano', img: 'https://image.tmdb.org/t/p/w500/udXvLxC5gAqN8SinemyFBEcHpTf.jpg', trailerId: 'Rav3rvrUlpI', schedules: ['09:30','12:00','15:00','18:20'], rating:'13', formats:'2D' },
    { id: 'toxico', title: 'Tóxico: Un cuento de hadas para adultos', img: 'https://image.tmdb.org/t/p/w500/bhpSB2g6yCKyxRgvgZ27KUgBHg6.jpg', trailerId: 'EfluEyQ5QIA', schedules: ['12:15','15:45','19:10'], rating:'R-17', formats:'2D' },
    { id: 'nimrods', title: 'Nimrods: A Green Day Comedy', img: 'https://image.tmdb.org/t/p/w500/aebmSpFu1lUV78PtOpqMUn4d82B.jpg', trailerId: 'jXcDo9SJYFo', schedules: ['10:10','13:40','17:20','20:50'], rating:'G', formats:'2D' },
    { id: 'alas', title: 'Esa cosa con alas', img: 'https://image.tmdb.org/t/p/w500/aaoS7XEWnKeQCa3EqWAXC803hlg.jpg', trailerId: 'SuOdfG5BxP8', schedules: ['11:00','14:00','17:30','20:30'], rating:'SP', formats:'2D' },
    { id: 'yo-narciso', title: 'Yo, narciso', img: 'https://image.tmdb.org/t/p/w500/3qe9gaT7jpKVJJ6UtM9Pr5jm3Hq.jpg', trailerId: 'W62EH7NIOXY', schedules: ['09:50','12:20','16:00','19:40'], rating:'G', formats:'2D' },
    { id: 'canelones', title: 'Canelones', img: 'https://image.tmdb.org/t/p/w500/s2g8wLNs6G5XYa5ivfUNuWbQTKQ.jpg', trailerId: 'xaDdORPOA2g', schedules: ['10:00','13:15','16:45','20:15'], rating:'SP', formats:'2D', premiere:true }
  ];

  const grid = document.getElementById('gallery-grid');

  // Player DOM refs
  const playerOverlay = document.getElementById('player-overlay');
  const playerBackdrop = document.getElementById('player-backdrop');
  const playerClose = document.getElementById('player-close');
  const playerIframe = document.getElementById('player-iframe');
  const scheduleColumns = document.getElementById('schedule-columns');

  function renderGallery(){
    grid.innerHTML = '';
    posters.forEach(p => {
      const card = document.createElement('article'); card.className = 'card';
      const wrap = document.createElement('div'); wrap.className = 'poster-wrap';
      const img = document.createElement('img'); img.className = 'poster'; img.src = p.img; img.alt = p.title; img.loading = 'lazy';
      wrap.appendChild(img);
      const duration = document.createElement('div'); duration.className = 'duration'; duration.textContent = p.schedules && p.schedules.length ? p.schedules[0] : '';
      wrap.appendChild(duration);
      const smile = document.createElement('div'); smile.className = 'smile'; smile.textContent = '☺'; wrap.appendChild(smile);
      card.appendChild(wrap);
      const body = document.createElement('div'); body.className = 'card-body';
      const title = document.createElement('h3'); title.className = 'card-title'; title.textContent = p.title;
      const rating = document.createElement('span'); rating.className = 'class-badge'; rating.textContent = p.rating; title.appendChild(rating); body.appendChild(title);
      const formats = document.createElement('div'); formats.className = 'formats'; formats.textContent = p.formats; body.appendChild(formats);
      card.appendChild(body);
      if(p.premiere){ const tag = document.createElement('div'); tag.className = 'premiere'; tag.textContent = 'Estreno'; card.appendChild(tag); }

      // click opens inline player (not redirect)
      card.addEventListener('click', ()=> openPlayer(p));

      grid.appendChild(card);
    });
  }

  // Categorize schedule times into mañana/tarde/noche
  function categorizeSchedules(times){
    const morning = [], afternoon = [], night = [];
    times.forEach(t => {
      // parse hour
      const parts = t.split(':');
      const hour = parseInt(parts[0],10);
      if(hour < 12) morning.push(t);
      else if(hour < 18) afternoon.push(t);
      else night.push(t);
    });
    return { morning, afternoon, night };
  }

  function openPlayer(movie){
    // set iframe src (autoplay)
    const src = `https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&rel=0`;
    playerIframe.src = src;

    // build schedule columns
    scheduleColumns.innerHTML = '';
    const { morning, afternoon, night } = categorizeSchedules(movie.schedules || []);
    const cols = [ {title:'Mañana', items: morning}, {title:'Tarde', items: afternoon}, {title:'Noche', items: night}];
    cols.forEach(col=>{
      const c = document.createElement('div'); c.className = 'schedule-col';
      const h = document.createElement('h4'); h.textContent = col.title; c.appendChild(h);
      const list = document.createElement('div'); list.className = 'schedule-list';
      if(col.items.length === 0){ const none = document.createElement('div'); none.className='schedule-item'; none.textContent = '-'; list.appendChild(none); }
      col.items.forEach(time=>{ const it = document.createElement('div'); it.className='schedule-item'; it.textContent = time; list.appendChild(it); });
      c.appendChild(list);
      scheduleColumns.appendChild(c);
    });

    // show overlay
    playerOverlay.classList.add('active');
    playerOverlay.setAttribute('aria-hidden','false');

    // close on backdrop click
    playerBackdrop.onclick = closePlayer;
    // close on Esc
    document.addEventListener('keydown', escHandler);
  }

  function closePlayer(){
    playerOverlay.classList.remove('active');
    playerOverlay.setAttribute('aria-hidden','true');
    // stop video
    playerIframe.src = '';
    document.removeEventListener('keydown', escHandler);
  }

  function escHandler(e){ if(e.key === 'Escape') closePlayer(); }

  playerClose.addEventListener('click', closePlayer);

  renderGallery();

  // Quick buy
  const quick = document.getElementById('quick-buy'); if(quick) quick.addEventListener('click', ()=> window.scrollTo({ top: 0, behavior: 'smooth' }));

});
