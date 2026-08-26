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
    { id: 'spiderman', title: 'Spider-Man: Brand New Day', img: 'https://image.tmdb.org/t/p/w500/9g0sEFhmvmK4nGhXj8DHuv2noYI.jpg', trailerId: 'QXibcL7-XbU', synopsis: 'Peter hace malabares con la vida normal y sus responsabilidades como Spider-Man, mientras surge una nueva amenaza.', schedules: { 'Lunes': ['10:00','13:30','16:00'], 'Miércoles': ['19:30','22:10'] } },
    { id: 'la-odisea', title: 'La Odisea', img: 'https://image.tmdb.org/t/p/w500/9aeb5U0saB7Tuu0QITaoENZBxFF.jpg', trailerId: '07DAunCV3Mw', synopsis: 'Un viaje épico a través de paisajes insólitos y desafíos personales.', schedules: { 'Martes': ['11:00','14:15'], 'Jueves': ['17:00','20:00'] } },
    { id: 'robin-hood', title: 'La muerte de Robin Hood', img: 'https://image.tmdb.org/t/p/w500/pC2hVl4J522GcMVc5OghRHSs0tq.jpg', trailerId: 'CE-B1PSgsnA', synopsis: 'Una mirada moderna y sombría a la historia del legendario forajido.', schedules: { 'Viernes': ['12:30','15:45','19:00'], 'Sábado': ['21:30'] } },
    { id: 'backrooms', title: 'Backrooms', img: 'https://image.tmdb.org/t/p/w500/ur2yYTVGPkEDmLdoQ1Obm2RKXuU.jpg', trailerId: '-pqmvEa0aMk', synopsis: 'Una inmersión en un laberinto que desafía la realidad.', schedules: { 'Domingo': ['10:30','13:00','16:30'] } },
    { id: 'oak-street', title: 'El final de Oak Street', img: 'https://image.tmdb.org/t/p/w500/g9DUGw8ufetrwhCIrwq3h1NlpWO.jpg', trailerId: 'EgkanoSZR44', synopsis: 'Los vecinos de Oak Street enfrentan una última noche de decisiones difíciles.', schedules: { 'Miércoles': ['12:00','15:15'], 'Domingo': ['18:20','21:00'] } }
  ];

  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const indicators = document.getElementById('carousel-indicators');
  let current = 0;

  function buildCarousel(){
    slides.forEach((s,i)=>{
      const slide = document.createElement('div'); slide.className='carousel-slide';

      // make the image/button open the same player as the gallery
      const btn = document.createElement('button'); btn.className = 'carousel-thumb'; btn.type = 'button';
      const img = document.createElement('img'); img.className = 'carousel-img'; img.src = s.img; img.alt = s.title; img.loading = 'lazy';
      // make image focusable for accessibility
      img.tabIndex = 0;
      btn.appendChild(img);

      // Clicking or pressing enter/space opens player
      btn.addEventListener('click', ()=> openPlayer(s, btn));
      img.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openPlayer(s, btn); } });

      slide.appendChild(btn);

      // caption with title + short synopsis
      const cap = document.createElement('div'); cap.className = 'carousel-caption';
      const tit = document.createElement('div'); tit.textContent = s.title; tit.className = 'carousel-title'; cap.appendChild(tit);
      if(s.synopsis){ const syn = document.createElement('p'); syn.className = 'carousel-synopsis'; syn.textContent = s.synopsis; cap.appendChild(syn); }

      // Quick schedule preview: show up to 3 times as buttons
      if(s.schedules){
        const schedWrap = document.createElement('div'); schedWrap.className = 'carousel-schedules';
        // If schedules is an object (days) show first day's items, else assume array
        if(typeof s.schedules === 'object' && !Array.isArray(s.schedules)){
          const days = Object.keys(s.schedules);
          if(days.length>0){
            const day = days[0];
            const times = s.schedules[day].slice(0,3);
            times.forEach(t => {
              const sb = document.createElement('button'); sb.className='schedule-item'; sb.type='button'; sb.textContent = `${day} ${t}`;
              sb.addEventListener('click', (e)=> { e.stopPropagation(); openBuy(s, day, t, sb); });
              schedWrap.appendChild(sb);
            });
          }
        } else if(Array.isArray(s.schedules)){
          s.schedules.slice(0,3).forEach(t=>{ const sb = document.createElement('button'); sb.className='schedule-item'; sb.type='button'; sb.textContent = t; sb.addEventListener('click',(e)=>{ e.stopPropagation(); openBuy(s, null, t, sb); }); schedWrap.appendChild(sb); });
        }
        cap.appendChild(schedWrap);
      }

      slide.appendChild(cap);
      track.appendChild(slide);

      const ind = document.createElement('button'); ind.addEventListener('click', ()=> goTo(i)); if(i===0) ind.classList.add('active'); indicators.appendChild(ind);
    });
  }

  function updateCarousel(){ track.style.transform = `translateX(${ -current*100 }%)`; Array.from(indicators.children).forEach((b,idx)=> b.classList.toggle('active', idx===current)); }
  function next(){ current = (current+1) % slides.length; updateCarousel(); }
  function prev(){ current = (current-1 + slides.length) % slides.length; updateCarousel(); }
  function goTo(i){ current = (i + slides.length) % slides.length; updateCarousel(); }
  prevBtn.addEventListener('click', prev); nextBtn.addEventListener('click', next); document.addEventListener('keydown', (e)=>{ if(e.key === 'ArrowRight') next(); if(e.key === 'ArrowLeft') prev(); });
  buildCarousel(); updateCarousel();

  // --- Cartelera gallery with trailers and schedules ---
  const posters = [
    { id: 'engendro', title: 'Engendro', img: 'https://image.tmdb.org/t/p/w500/cVQFWGIt5PNw3p7AcQOq2Eg39G.jpg', trailerId: 'gelyoVzunGw', synopsis: 'Una historia inquietante sobre lo inesperado en un pueblo aparentemente tranquilo.', schedules: { 'Lunes': ['10:00','13:30','16:00','19:30','22:10'] }, rating: '15+' },
    { id: 'invitacion', title: 'La invitación', img: 'https://image.tmdb.org/t/p/w500/21JnfyCARiRkms9AZHtTXiZKbIj.jpg', trailerId: 'G7Bo0yV2Xvw', synopsis: 'Una reunión que se convierte en algo mucho más oscuro.', schedules: { 'Martes': ['11:00','14:15','17:00','20:00'] }, rating: 'C' },
    { id: 'miasma', title: 'Adolescencia, sexo y muerte en campamento Miasma', img: 'https://image.tmdb.org/t/p/w500/8UTCpwvHxWPllCJ7YnaCbffmYyD.jpg', trailerId: 'In4T87vp2xA', synopsis: 'Un grupo de adolescentes afronta deseos, miedos y secretos en un campamento aislado.', schedules: { 'Miércoles': ['09:45','12:30','15:00'] }, rating: '13+' },
    { id: 'insaciable', title: 'Insaciable', img: 'https://image.tmdb.org/t/p/w500/v9st6lwP4K2i6YCa7kLQVQEuvNZ.jpg', trailerId: 'zIVcNrO-ZFE', synopsis: 'Una ambición implacable pone en peligro todo a su alrededor.', schedules: { 'Jueves': ['10:30','13:00','16:30','19:00'] }, rating: '16+' },
    { id: 'victoria', title: 'Tiempo de victoria', img: 'https://image.tmdb.org/t/p/w500/byKFPj2xvKkqMKQ4i0Ayq6N7Z9E.jpg', trailerId: 'xIkH-xUVLbk', synopsis: 'La lucha por el triunfo personal en tiempos difíciles.', schedules: { 'Viernes': ['11:30','14:45','18:00','21:15'] }, rating: 'A' },
    { id: 'arbol', title: 'El árbol muy muy lejano', img: 'https://image.tmdb.org/t/p/w500/udXvLxC5gAqN8SinemyFBEcHpTf.jpg', trailerId: 'Rav3rvrUlpI', synopsis: 'Un viaje mágico hacia un árbol que guarda antiguos secretos.', schedules: { 'Sábado': ['09:30','12:00','15:00','18:20'] }, rating: 'TP' },
    { id: 'toxico', title: 'Tóxico: Un cuento de hadas para adultos', img: 'https://image.tmdb.org/t/p/w500/bhpSB2g6yCKyxRgvgZ27KUgBHg6.jpg', trailerId: 'EfluEyQ5QIA', synopsis: 'Fábula oscura que mezcla humor y pesadilla.', schedules: { 'Domingo': ['12:15','15:45','19:30'] }, rating: '18+' }
  ];

  const grid = document.getElementById('gallery-grid');

  // Player DOM refs
  const playerOverlay = document.getElementById('player-overlay');
  const playerBackdrop = document.getElementById('player-backdrop');
  const playerClose = document.getElementById('player-close');
  const playerIframe = document.getElementById('player-iframe');
  const scheduleColumns = document.getElementById('schedule-columns');

  // Buy modal refs
  const buyOverlay = document.getElementById('buy-overlay');
  const buyClose = document.getElementById('buy-close');
  const buyTitle = document.getElementById('buy-title');
  const buyInfo = document.getElementById('buy-info');
  const buyProceed = document.getElementById('buy-proceed');

  let previouslyFocused = null;

  function renderGallery(){
    grid.innerHTML = '';
    posters.forEach(p => {
      const card = document.createElement('article'); card.className = 'card';
      const wrap = document.createElement('div'); wrap.className = 'poster-wrap';
      const img = document.createElement('img'); img.className = 'poster'; img.src = p.img; img.alt = p.title; img.loading = 'lazy';
      img.tabIndex = 0; // make focusable
      wrap.appendChild(img);
      const duration = document.createElement('div'); duration.className = 'duration'; duration.textContent = p.schedules && (Array.isArray(p.schedules)? p.schedules[0] : Object.values(p.schedules)[0][0]) || '';
      wrap.appendChild(duration);
      const smile = document.createElement('div'); smile.className = 'smile'; smile.textContent = '☺'; wrap.appendChild(smile);
      card.appendChild(wrap);
      const body = document.createElement('div'); body.className = 'card-body';
      const title = document.createElement('h3'); title.className = 'card-title'; title.textContent = p.title;
      const rating = document.createElement('span'); rating.className = 'class-badge'; rating.textContent = p.rating; title.appendChild(rating); body.appendChild(title);
      const formats = document.createElement('div'); formats.className = 'formats'; formats.textContent = p.formats || '';
      body.appendChild(formats);
      card.appendChild(body);
      if(p.premiere){ const tag = document.createElement('div'); tag.className = 'premiere'; tag.textContent = 'Estreno'; card.appendChild(tag); }

      // click opens inline player (not redirect)
      card.addEventListener('click', ()=> openPlayer(p, img));
      img.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openPlayer(p, img); } });

      grid.appendChild(card);
    });
  }

  // Categorize schedule times into mañana/tarde/noche
  function categorizeSchedules(times){
    const morning = [], afternoon = [], night = [];
    times.forEach(t => {
      const parts = t.split(':');
      const hour = parseInt(parts[0],10);
      if(hour < 12) morning.push(t);
      else if(hour < 18) afternoon.push(t);
      else night.push(t);
    });
    return { morning, afternoon, night };
  }

  function buildScheduleColumnsForMovie(movie){
    scheduleColumns.innerHTML = '';
    // support schedules as object (days) or array
    if(movie.schedules && typeof movie.schedules === 'object' && !Array.isArray(movie.schedules)){
      // iterate days in order
      Object.keys(movie.schedules).forEach(day => {
        const times = movie.schedules[day] || [];
        const dayCol = document.createElement('div'); dayCol.className = 'schedule-col';
        const h = document.createElement('h4'); h.textContent = day; dayCol.appendChild(h);
        const list = document.createElement('div'); list.className = 'schedule-list';
        if(times.length === 0){ const none = document.createElement('div'); none.className='schedule-item'; none.textContent = '-'; list.appendChild(none); }
        else {
          // categorize for visual label inside each day
          const { morning, afternoon, night } = categorizeSchedules(times);
          const showSection = (label, arr) => {
            if(arr.length===0) return;
            const secLabel = document.createElement('div'); secLabel.className='time-section-label'; secLabel.textContent = label; list.appendChild(secLabel);
            arr.forEach(time => { const it = document.createElement('button'); it.className='schedule-item'; it.type='button'; it.textContent = time; it.addEventListener('click', (e)=> { e.stopPropagation(); openBuy(movie, day, time, it); }); list.appendChild(it); });
          };
          showSection('Mañana', morning);
          showSection('Tarde', afternoon);
          showSection('Noche', night);
        }
        dayCol.appendChild(list);
        scheduleColumns.appendChild(dayCol);
      });
    } else {
      // fallback to previous behavior: single set categorized into three columns
      const times = Array.isArray(movie.schedules)? movie.schedules : [];
      const { morning, afternoon, night } = categorizeSchedules(times);
      const cols = [ {title:'Mañana', items: morning}, {title:'Tarde', items: afternoon}, {title:'Noche', items: night}];
      cols.forEach(col=>{
        const c = document.createElement('div'); c.className = 'schedule-col';
        const h = document.createElement('h4'); h.textContent = col.title; c.appendChild(h);
        const list = document.createElement('div'); list.className = 'schedule-list';
        if(col.items.length === 0){ const none = document.createElement('div'); none.className='schedule-item'; none.textContent = '-'; list.appendChild(none); }
        col.items.forEach(time=>{ const it = document.createElement('button'); it.className='schedule-item'; it.type='button'; it.textContent = time; it.addEventListener('click',(e)=>{ e.stopPropagation(); openBuy(movie, null, time, it); }); list.appendChild(it); });
        c.appendChild(list);
        scheduleColumns.appendChild(c);
      });
    }
  }

  function openPlayer(movie, opener){
    previouslyFocused = opener || document.activeElement;

    // set iframe src (autoplay)
    const src = `https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&rel=0`;
    playerIframe.src = src;

    // build schedule columns
    buildScheduleColumnsForMovie(movie);

    // show overlay
    playerOverlay.classList.add('active');
    playerOverlay.setAttribute('aria-hidden','false');

    // focus management for accessibility: move focus to close button
    setTimeout(()=>{ if(playerClose) playerClose.focus(); }, 60);

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
    // restore focus to previously focused element (poster/carousel thumb)
    try{ if(previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus(); }catch(e){}
  }

  function escHandler(e){ if(e.key === 'Escape') closePlayer(); }

  if(playerClose) playerClose.addEventListener('click', closePlayer);

  // BUY modal logic
  function openBuy(movie, day, time, opener){
    previouslyFocused = opener || document.activeElement;
    if(!buyOverlay) return alert('Compra: \n' + movie.title + (day? (' - ' + day) : '') + (time? (' ' + time) : ''));

    buyTitle.textContent = movie.title;
    buyInfo.textContent = (day? (day + ' ') : '') + (time? time : 'Horario seleccionado');
    buyOverlay.classList.add('active');
    buyOverlay.setAttribute('aria-hidden','false');
    setTimeout(()=>{ if(buyClose) buyClose.focus(); }, 20);

    // wire proceed
    buyProceed.onclick = ()=>{ // placeholder purchase flow
      // here you would start the real checkout flow. For demo, show a small confirmation
      alert(`Iniciando compra para ${movie.title} ${day? day+ ' ' : ''}${time? time : ''}`);
      closeBuy();
    };

    // close handlers
    document.addEventListener('keydown', buyEscHandler);
  }

  function closeBuy(){
    if(!buyOverlay) return;
    buyOverlay.classList.remove('active');
    buyOverlay.setAttribute('aria-hidden','true');
    document.removeEventListener('keydown', buyEscHandler);
    try{ if(previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus(); }catch(e){}
  }
  function buyEscHandler(e){ if(e.key === 'Escape') closeBuy(); }
  if(buyClose) buyClose.addEventListener('click', closeBuy);

  renderGallery();

  // Quick buy
  const quick = document.getElementById('quick-buy'); if(quick) quick.addEventListener('click', ()=> window.scrollTo({ top: 0, behavior: 'smooth' }));

});
