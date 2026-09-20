// script.js - Carousel + cartelera gallery & embedded trailer player

document.addEventListener('DOMContentLoaded', ()=>{
  // --- Loader: animated "Ticket Cine" intro ---
  const loader = document.getElementById('loader-overlay');
  const loaderTitle = document.getElementById('loader-title');

  if(loaderTitle){
    const text = "Ticket Cine";
    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      if(char === ' ') span.classList.add('space');
      span.style.animationDelay = `${i * 0.07}s`;
      loaderTitle.appendChild(span);
    });
  }

  // Give the animation room to finish (letters + underline finish around 2.2s)
  // before the splash hides and the site becomes visible.
  const minDisplay = 2200; const maxFallback = 3200; const start = performance.now(); let hidden=false;
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

      // left (image)
      const left = document.createElement('div'); left.className = 'carousel-left';
      const btn = document.createElement('button'); btn.className = 'carousel-thumb'; btn.type = 'button';
      const img = document.createElement('img'); img.className = 'carousel-img'; img.src = s.img; img.alt = s.title; img.loading = 'lazy';
      img.tabIndex = 0;
      btn.appendChild(img);
      btn.addEventListener('click', ()=> openPlayer(s, btn));
      img.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openPlayer(s, btn); } });
      left.appendChild(btn);

      // right (info)
      const right = document.createElement('div'); right.className = 'carousel-right';
      const info = document.createElement('div'); info.className = 'carousel-info';
      const tit = document.createElement('div'); tit.textContent = s.title; tit.className = 'carousel-title'; info.appendChild(tit);
      if(s.synopsis){ const syn = document.createElement('p'); syn.className = 'carousel-synopsis'; syn.textContent = s.synopsis; info.appendChild(syn); }

      if(s.schedules){
        const schedWrap = document.createElement('div'); schedWrap.className = 'carousel-schedules';
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
        info.appendChild(schedWrap);
      }

      right.appendChild(info);

      slide.appendChild(left);
      slide.appendChild(right);

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
  const scheduleContinue = document.getElementById('schedule-continue');
  let selectedSchedule = null;

  // Buy modal refs
  const buyOverlay = document.getElementById('buy-overlay');
  const buyClose = document.getElementById('buy-close');
  const buyTitle = document.getElementById('buy-title');
  const buyInfo = document.getElementById('buy-info');
  const buyProceed = document.getElementById('buy-proceed');

  // Form refs
  const buyForm = document.getElementById('buy-form');
  const buyQty = document.getElementById('buy-qty');
  const buyType = document.getElementById('buy-type');
  const buyPrice = document.getElementById('buy-price');
  const buyTotal = document.getElementById('buy-total');
  const buyerName = document.getElementById('buyer-name');

  // Success overlay refs
  const successOverlay = document.getElementById('success-overlay');
  const successClose = document.getElementById('success-close');
  const successTitle = document.getElementById('success-title');
  const successSub = document.getElementById('success-sub');

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

  function selectScheduleItem(movie, day, time, btnEl){
    document.querySelectorAll('.schedule-item.selected').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
    selectedSchedule = { movie, day, time };
    if(scheduleContinue) scheduleContinue.classList.add('visible');
  }

  function resetScheduleSelection(){
    selectedSchedule = null;
    if(scheduleContinue) scheduleContinue.classList.remove('visible');
  }

  function buildScheduleColumnsForMovie(movie){
    scheduleColumns.innerHTML = '';
    resetScheduleSelection();
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
            arr.forEach(time => { const it = document.createElement('button'); it.className='schedule-item'; it.type='button'; it.textContent = time; it.addEventListener('click', (e)=> { e.stopPropagation(); selectScheduleItem(movie, day, time, it); }); list.appendChild(it); });
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
        col.items.forEach(time=>{ const it = document.createElement('button'); it.className='schedule-item'; it.type='button'; it.textContent = time; it.addEventListener('click',(e)=>{ e.stopPropagation(); selectScheduleItem(movie, null, time, it); }); list.appendChild(it); });
        c.appendChild(list);
        scheduleColumns.appendChild(c);
      });
    }
  }

  function updatePrice(){
    if(!buyQty || !buyType || !buyPrice || !buyTotal) return;
    const qty = Math.max(1, Math.min(10, parseInt(buyQty.value,10) || 1));
    buyQty.value = qty;
    const opt = buyType.selectedOptions[0];
    const unit = parseFloat(opt.getAttribute('data-price')) || 0;
    buyPrice.textContent = `$${unit}`;
    buyTotal.textContent = `$${unit * qty}`;
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

    if(typeof window.__logActivity === 'function') window.__logActivity('trailer', `Viste el tráiler de "${movie.title}"`);

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
    resetScheduleSelection();
    // restore focus to previously focused element (poster/carousel thumb)
    try{ if(previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus(); }catch(e){}
  }

  function escHandler(e){ if(e.key === 'Escape') closePlayer(); }

  if(playerClose) playerClose.addEventListener('click', closePlayer);

  if(scheduleContinue) scheduleContinue.addEventListener('click', ()=>{
    if(!selectedSchedule) return;
    closePlayer();
    document.getElementById('ticketcine-home').hidden = true;
    const clipsAppEl = document.getElementById('clips-app');
    if(clipsAppEl && !clipsAppEl.hidden && typeof window.__pauseClips === 'function') window.__pauseClips();
    if(clipsAppEl) clipsAppEl.hidden = true;
    const searchAppEl = document.getElementById('search-app');
    if(searchAppEl) searchAppEl.hidden = true;
    document.getElementById('horarios-app').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  // BUY modal logic
  function openBuy(movie, day, time, opener){
    previouslyFocused = opener || document.activeElement;
    if(!buyOverlay) return alert('Compra: \n' + movie.title + (day? (' - ' + day) : '') + (time? (' ' + time) : ''));

    buyTitle.textContent = movie.title;
    buyInfo.textContent = (day? (day + ' ') : '') + (time? time : 'Horario seleccionado');

    // reset form defaults
    if(buyQty) buyQty.value = 1;
    if(buyType) buyType.selectedIndex = 0;
    updatePrice();

    buyOverlay.classList.add('active');
    buyOverlay.setAttribute('aria-hidden','false');
    setTimeout(()=>{ if(buyClose) buyClose.focus(); }, 20);

    // wire proceed (validate and show success overlay)
    if(buyProceed) buyProceed.onclick = ()=>{
      // basic validation
      const qty = buyQty? Math.max(1, parseInt(buyQty.value,10) || 1) : 1;
      const name = buyerName? (buyerName.value || '').trim() : '';
      if(!name){
        if(buyerName){ buyerName.focus(); }
        return; // require name for demo
      }

      // close buy modal
      closeBuy();

      // show success overlay (no real payment integration)
      showSuccess(movie.title);
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

  // success overlay handlers
  function showSuccess(title){
    if(!successOverlay) return alert('Felicitaciones por su compra\nListo para la aventura: le enviamos el ticket a su email');
    successTitle.textContent = 'Felicitaciones por su compra';
    successSub.textContent = '¿Listo para la aventura? Te enviamos el Ticket de compra a su email';
    successOverlay.classList.add('active');
    successOverlay.setAttribute('aria-hidden','false');
    setTimeout(()=>{ if(successClose) successClose.focus(); }, 30);
    document.addEventListener('keydown', successEscHandler);
  }
  function closeSuccess(){
    if(!successOverlay) return;
    successOverlay.classList.remove('active');
    successOverlay.setAttribute('aria-hidden','true');
    document.removeEventListener('keydown', successEscHandler);
    try{ if(previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus(); }catch(e){}
  }
  function successEscHandler(e){ if(e.key === 'Escape') closeSuccess(); }
  if(successClose) successClose.addEventListener('click', closeSuccess);

  // wire price updates
  if(buyQty) buyQty.addEventListener('input', updatePrice);
  if(buyType) buyType.addEventListener('change', updatePrice);

  renderGallery();

  // Quick buy
  const quick = document.getElementById('quick-buy'); if(quick) quick.addEventListener('click', ()=> window.scrollTo({ top: 0, behavior: 'smooth' }));

  // --- Barra de navegación inferior: Inicio / Clips / Buscar ---
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  bottomNavItems.forEach(btn => {
    btn.addEventListener('click', () => {
      bottomNavItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if(btn.dataset.section === 'inicio'){
        const horariosApp = document.getElementById('horarios-app');
        const clipsApp = document.getElementById('clips-app');
        const searchApp = document.getElementById('search-app');
        const home = document.getElementById('ticketcine-home');
        if(horariosApp) horariosApp.hidden = true;
        if(clipsApp && !clipsApp.hidden && typeof window.__pauseClips === 'function') window.__pauseClips();
        if(clipsApp) clipsApp.hidden = true;
        if(searchApp) searchApp.hidden = true;
        if(home) home.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      // 'buscar' se conecta más abajo, en el módulo de Búsqueda
    });
  });

  // Se exponen para que el módulo de Búsqueda abra el mismo modal
  // de tráiler + horarios que usan el carrusel y la cartelera.
  window.__allMovies = [...slides, ...posters];
  window.__openMoviePlayer = openPlayer;

});

// ============================================================
// Clips: adelantos en formato vertical (estilo Reels)
// ============================================================
(function(){
  const CLIP_VIDEOS = [
    { title: "Spider-Man: Brand New Day", id: "i6OfBlm8lRM" },
    { title: "La Odisea", id: "6T7SJntyEs4" },
    { title: "La muerte de Robin Hood", id: "0oBUb0M-O3U" },
    { title: "Coyote vs. Acme", id: "ATviRowohkg" },
    { title: "Backrooms", id: "5QTbL5Mi28M" },
    { title: "El final de Oak Street", id: "f-O7HrsHoP8" },
    { title: "Tu corazón se romperá", id: "b9_SNkZj3OE" },
    { title: "Insidious: Fuera del más allá", id: "gsDjAFfoQN4" },
    { title: "Engendro", id: "0AIZJh2DBak" },
    { title: "Adolescencia, sexo y muerte en campamento Miasma", id: "j9TsiTgYZGw" },
    { title: "Tiempo de victoria", id: "MQq8Zpf-6bI" },
    { title: "El árbol muy muy lejano", id: "9DqKisDbc2w" },
    { title: "Nimrods: A Green Day Comedy", id: "1HgB3l-wEoo" },
    { title: "Esa cosa con alas", id: "VCb1HW7DLR0" },
    { title: "Yo, narciso", id: "0M3Z0Nvyjh0" },
  ];

  const clipsApp = document.getElementById('clips-app');
  const clipsFeed = document.getElementById('clips-feed');
  const clipsBackBtn = document.getElementById('clipsBackBtn');
  if(!clipsApp || !clipsFeed) return;

  let clipsMuted = true;
  let clipsBuilt = false;

  function clipYtSrc(id){
    return `https://www.youtube.com/embed/${id}?enablejsapi=1&playsinline=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${id}&mute=1`;
  }

  function clipPostCmd(iframe, func, args){
    if(!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(JSON.stringify({event:'command', func, args: args || []}), '*');
  }

  function clipPanels(){
    return Array.from(clipsFeed.querySelectorAll('.clip-panel'));
  }

  function closestClipPanel(){
    const list = clipPanels();
    const feedTop = clipsFeed.scrollTop;
    let closest = list[0];
    let closestDist = Infinity;
    list.forEach(p => {
      const dist = Math.abs(p.offsetTop - feedTop);
      if(dist < closestDist){ closestDist = dist; closest = p; }
    });
    return closest;
  }

  function buildClipsFeed(){
    if(clipsBuilt) return;
    clipsBuilt = true;

    CLIP_VIDEOS.forEach((v, i) => {
      const panel = document.createElement('div');
      panel.className = 'clip-panel';
      panel.dataset.index = i;

      panel.innerHTML = `
        <div class="video-wrap">
          <iframe data-idx="${i}" src="${clipYtSrc(v.id)}"
            allow="autoplay; encrypted-media" title="${v.title}"></iframe>
        </div>
        <div class="scrim"></div>
        <div class="clip-brand">TICKET CINE</div>
        <button class="sound-btn" aria-label="Sonido">${i===0 ? '🔇' : '🔈'}</button>
        <div class="rail">${CLIP_VIDEOS.map((_, j) => `<div class="perf ${j===i?'active':''}"></div>`).join('')}</div>
        <div class="info">
          <div class="eyebrow"><span class="dot"></span>ADELANTO</div>
          <h1 class="clip-title">${v.title}</h1>
          <div class="cta-row">
            <button class="btn primary">Ver funciones</button>
            <button class="btn">+ Info</button>
          </div>
        </div>
      `;

      panel.querySelector('.sound-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        clipsMuted = !clipsMuted;
        clipsFeed.querySelectorAll('.sound-btn').forEach(b => b.textContent = clipsMuted ? '🔇' : '🔈');
        clipPostCmd(panel.querySelector('iframe'), clipsMuted ? 'mute' : 'unMute');
      });

      clipsFeed.appendChild(panel);
    });

    // Reproduce el panel visible, pausa el resto
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const iframe = entry.target.querySelector('iframe');
        if(entry.isIntersecting && entry.intersectionRatio > 0.6){
          clipPostCmd(iframe, 'playVideo');
        } else {
          clipPostCmd(iframe, 'pauseVideo');
        }
      });
    }, { root: clipsFeed, threshold: [0, 0.6, 1] });

    clipPanels().forEach(p => observer.observe(p));
  }

  function pauseAllClips(){
    clipsFeed.querySelectorAll('iframe').forEach(iframe => clipPostCmd(iframe, 'pauseVideo'));
  }
  // Usado desde el botón "Inicio" de la barra inferior para cortar el audio si venís de Clips
  window.__pauseClips = pauseAllClips;

  function playCurrentClip(){
    const panel = closestClipPanel();
    if(!panel) return;
    setTimeout(() => clipPostCmd(panel.querySelector('iframe'), 'playVideo'), 300);
  }

  function showClips(){
    buildClipsFeed();
    const home = document.getElementById('ticketcine-home');
    const horariosApp = document.getElementById('horarios-app');
    const searchApp = document.getElementById('search-app');
    if(home) home.hidden = true;
    if(horariosApp) horariosApp.hidden = true;
    if(searchApp) searchApp.hidden = true;
    clipsApp.hidden = false;
    playCurrentClip();
  }

  function hideClips(){
    pauseAllClips();
    clipsApp.hidden = true;
    const home = document.getElementById('ticketcine-home');
    if(home) home.hidden = false;
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    const inicioBtn = document.querySelector('.bottom-nav-item[data-section="inicio"]');
    if(inicioBtn) inicioBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  if(clipsBackBtn) clipsBackBtn.addEventListener('click', hideClips);

  const clipsNavBtn = document.querySelector('.bottom-nav-item[data-section="clips"]');
  if(clipsNavBtn) clipsNavBtn.addEventListener('click', showClips);

  // Navegación con flechas del teclado, solo mientras Clips está visible
  window.addEventListener('keydown', (e) => {
    if(clipsApp.hidden) return;
    if(e.key === 'Escape'){ hideClips(); return; }
    if(e.key !== 'ArrowDown' && e.key !== 'PageDown' && e.key !== 'ArrowUp' && e.key !== 'PageUp') return;
    e.preventDefault();
    const list = clipPanels();
    const current = closestClipPanel();
    const idx = list.indexOf(current);
    const dir = (e.key === 'ArrowDown' || e.key === 'PageDown') ? 1 : -1;
    const target = list[Math.max(0, Math.min(list.length - 1, idx + dir))];
    if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

// ============================================================
// Buscar: sugiere películas a medida que el usuario escribe,
// reutilizando el mismo modal de tráiler + horarios de la home.
// ============================================================
(function(){
  // Películas que no están en el carrusel/cartelera de la home
  // (se usan igual, con la misma imagen y, cuando hay, el mismo
  // trailerId que ya usamos en Clips).
  const SEARCH_EXTRA_MOVIES = [
    { title: "Tu corazón se romperá", img: "https://image.tmdb.org/t/p/w500/siSnG1h8JKkuHgM0RuOWLcNxSbz.jpg", trailerId: "b9_SNkZj3OE" },
    { title: "Insidious: Fuera del más allá", img: "https://image.tmdb.org/t/p/w500/peE3VhpRbIW9VtW2SRaf893JMzJ.jpg", trailerId: "gsDjAFfoQN4" },
    { title: "Nimrods: A Green Day Comedy", img: "https://image.tmdb.org/t/p/w500/aebmSpFu1lUV78PtOpqMUn4d82B.jpg", trailerId: "1HgB3l-wEoo" },
    { title: "Esa cosa con alas", img: "https://image.tmdb.org/t/p/w500/aaoS7XEWnKeQCa3EqWAXC803hlg.jpg", trailerId: "VCb1HW7DLR0" },
    { title: "Yo, narciso", img: "https://image.tmdb.org/t/p/w500/3qe9gaT7jpKVJJ6UtM9Pr5jm3Hq.jpg", trailerId: "0M3Z0Nvyjh0" },
    { title: "Canelones", img: "https://image.tmdb.org/t/p/w500/s2g8wLNs6G5XYa5ivfUNuWbQTKQ.jpg" },
  ];

  const searchApp = document.getElementById('search-app');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchBackBtn = document.getElementById('searchBackBtn');
  const searchClearBtn = document.getElementById('searchClearBtn');
  if(!searchApp || !searchInput || !searchResults) return;

  function getAllMovies(){
    const base = Array.isArray(window.__allMovies) ? window.__allMovies : [];
    return base.concat(SEARCH_EXTRA_MOVIES);
  }

  function renderResults(query){
    const movies = getAllMovies();
    const q = query.trim().toLowerCase();
    const filtered = q ? movies.filter(m => m.title.toLowerCase().includes(q)) : movies;

    searchResults.innerHTML = '';
    if(searchClearBtn) searchClearBtn.hidden = q.length === 0;

    if(filtered.length === 0){
      const empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = 'No encontramos ninguna película con ese nombre.';
      searchResults.appendChild(empty);
      return;
    }

    filtered.forEach(movie => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'search-result';

      const img = document.createElement('img');
      img.src = movie.img;
      img.alt = movie.title;
      img.loading = 'lazy';
      card.appendChild(img);

      const title = document.createElement('div');
      title.className = 'search-result-title';
      title.textContent = movie.title;
      card.appendChild(title);

      // Mismo protocolo que las películas de la home: abre el
      // modal de tráiler + horarios con la misma función.
      card.addEventListener('click', () => {
        if(typeof window.__openMoviePlayer === 'function') window.__openMoviePlayer(movie, card);
      });

      searchResults.appendChild(card);
    });
  }

  searchInput.addEventListener('input', () => renderResults(searchInput.value));

  if(searchClearBtn) searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    renderResults('');
    searchInput.focus();
  });

  function showSearch(){
    const home = document.getElementById('ticketcine-home');
    const horariosApp = document.getElementById('horarios-app');
    const clipsApp = document.getElementById('clips-app');
    if(home) home.hidden = true;
    if(horariosApp) horariosApp.hidden = true;
    if(clipsApp && !clipsApp.hidden && typeof window.__pauseClips === 'function') window.__pauseClips();
    if(clipsApp) clipsApp.hidden = true;
    searchApp.hidden = false;
    renderResults(searchInput.value);
    setTimeout(() => searchInput.focus(), 50);
  }

  function hideSearch(){
    searchApp.hidden = true;
    const home = document.getElementById('ticketcine-home');
    if(home) home.hidden = false;
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    const inicioBtn = document.querySelector('.bottom-nav-item[data-section="inicio"]');
    if(inicioBtn) inicioBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  if(searchBackBtn) searchBackBtn.addEventListener('click', hideSearch);

  const searchNavBtn = document.querySelector('.bottom-nav-item[data-section="buscar"]');
  if(searchNavBtn) searchNavBtn.addEventListener('click', showSearch);

  window.addEventListener('keydown', (e) => {
    if(searchApp.hidden) return;
    if(e.key === 'Escape') hideSearch();
  });
})();


// ============================================================
// Flujo de Horarios / Butacas / Snacks / Pago / Factura
// ============================================================
// ---------- Datos ----------

  const CINES = [
    { name: "Cinemark Caballito", address: "Av. La Plata 96, Caballito, CABA" },
    { name: "Hoyts Abasto", address: "Av. Corrientes 3247, Abasto, CABA" },
    { name: "Cinemark Palermo", address: "Beruti 3399, Palermo, CABA" },
    { name: "Cinemark Puerto Madero", address: "Av. Alicia Moreau de Justo 1920, Puerto Madero, CABA" },
    { name: "Cinemark Quilmes", address: "Quilmes Factory Shopping, Quilmes, Buenos Aires" },
    { name: "Cinemark Unicenter", address: "Unicenter Shopping, Martínez, Buenos Aires" },
    { name: "Cinemark Nine Moreno", address: "Av. Victorica 1128, Nine Shopping, Moreno, Buenos Aires" },
    { name: "Hoyts Plaza Oeste", address: "J. M. de Rosas 658, Plaza Oeste Shopping, Morón, Buenos Aires" }
  ];

  // Cada formato define el nivel de disponibilidad que se enciende
  const FORMATOS = [
    { name: "2D", level: "alta", price: 6500 },
    { name: "3D", level: "media", price: 8000 },
    { name: "MAX", level: "alta", price: 9500 },
    { name: "XD", level: "media", price: 8500 },
    { name: "4D E-Motion", level: "baja", price: 11000 },
    { name: "VIP", level: "lleno", price: 14000 }
  ];

  const IDIOMAS = [
    { name: "Español" },
    { name: "Inglés" },
    { name: "Portugués" },
    { name: "Chino" }
  ];

  // ---------- Estado (se mantiene mientras dure la sesión) ----------

  const state = {
    cine: null,
    formato: null,
    idioma: null
  };

  const checkIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  // ---------- Construcción de paneles ----------

  function buildCinePanel(){
    const panel = document.getElementById('cinePanel');
    panel.innerHTML = '';
    CINES.forEach(cine => {
      const row = document.createElement('div');
      row.className = 'option-row' + (state.cine === cine.name ? ' selected' : '');
      row.innerHTML = `
        <div class="option-main">
          <span class="option-name">${cine.name}</span>
          <span class="option-address">${cine.address}</span>
        </div>
        <span class="check">${checkIcon}</span>
      `;
      row.addEventListener('click', () => {
        state.cine = cine.name;
        refreshUI();
        closePanel('cine');
      });
      panel.appendChild(row);
    });
  }

  function buildFormatoPanel(){
    const panel = document.getElementById('formatoPanel');
    panel.innerHTML = '';
    FORMATOS.forEach(f => {
      const row = document.createElement('div');
      row.className = 'option-row' + (state.formato === f.name ? ' selected' : '');
      row.innerHTML = `
        <div class="option-main">
          <span class="option-name">${f.name}</span>
        </div>
        <span class="check">${checkIcon}</span>
      `;
      row.addEventListener('click', () => {
        state.formato = f.name;
        refreshUI();
        closePanel('formato');
      });
      panel.appendChild(row);
    });
  }

  function buildIdiomaPanel(){
    const panel = document.getElementById('idiomaPanel');
    panel.innerHTML = '';
    IDIOMAS.forEach(i => {
      const row = document.createElement('div');
      row.className = 'option-row' + (state.idioma === i.name ? ' selected' : '');
      row.innerHTML = `
        <div class="option-main">
          <span class="option-name">${i.name}</span>
        </div>
        <span class="check">${checkIcon}</span>
      `;
      row.addEventListener('click', () => {
        state.idioma = i.name;
        refreshUI();
        closePanel('idioma');
      });
      panel.appendChild(row);
    });
  }

  // ---------- Apertura / cierre de paneles ----------

  const panelRefs = {
    cine: { btn: document.getElementById('carteleraBtn'), panel: document.getElementById('cinePanel') },
    formato: { btn: document.getElementById('formatosBtn'), panel: document.getElementById('formatoPanel') },
    idioma: { btn: document.getElementById('idiomaBtn'), panel: document.getElementById('idiomaPanel') }
  };

  function closeAllPanels(){
    Object.keys(panelRefs).forEach(key => closePanel(key));
  }

  function closePanel(key){
    panelRefs[key].btn.classList.remove('open');
    panelRefs[key].panel.classList.remove('open');
    updateFiltersPanelsWrap();
  }

  function openPanel(key){
    const wasOpen = panelRefs[key].panel.classList.contains('open');
    closeAllPanels();
    if(!wasOpen){
      panelRefs[key].btn.classList.add('open');
      panelRefs[key].panel.classList.add('open');
    }
    updateFiltersPanelsWrap();
  }

  function updateFiltersPanelsWrap(){
    const wrap = document.getElementById('filtersPanels');
    const anyOpen = document.getElementById('formatoPanel').classList.contains('open') ||
                    document.getElementById('idiomaPanel').classList.contains('open');
    wrap.classList.toggle('any-open', anyOpen);
  }

  document.getElementById('carteleraBtn').addEventListener('click', () => openPanel('cine'));
  document.getElementById('formatosBtn').addEventListener('click', () => openPanel('formato'));
  document.getElementById('idiomaBtn').addEventListener('click', () => openPanel('idioma'));

  // ---------- Refrescar toda la UI segun el estado ----------

  function refreshUI(){
    buildCinePanel();
    buildFormatoPanel();
    buildIdiomaPanel();

    document.getElementById('cinePicked').textContent = state.cine || '';
    document.getElementById('formatoPicked').textContent = state.formato || '';
    document.getElementById('idiomaPicked').textContent = state.idioma || '';

    document.getElementById('cineNameDisplay').textContent =
      state.cine ? state.cine : 'Elegí tu cine para continuar';

    // Disponibilidad de asientos según el formato elegido
    const activeLevel = state.formato
      ? FORMATOS.find(f => f.name === state.formato).level
      : null;

    document.querySelectorAll('.avail-item').forEach(item => {
      const level = item.getAttribute('data-level');
      item.classList.remove('dimmed', 'highlighted');
      if(activeLevel){
        if(level === activeLevel){
          item.classList.add('highlighted');
        } else {
          item.classList.add('dimmed');
        }
      }
    });

    // Habilitar Continuar solo cuando hay cine, formato e idioma elegidos
    const continuarBtn = document.getElementById('continuarBtn');
    continuarBtn.disabled = !(state.cine && state.formato && state.idioma);
  }

  // ---------- Init ----------

  buildCinePanel();
  buildFormatoPanel();
  buildIdiomaPanel();
  refreshUI();

  // ---------- Vista: elegir butaca ----------

  const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const SEATS_PER_SIDE = 5; // 5 + pasillo + 5 = 10 butacas por fila

  // Butacas ya ocupadas (fijo, a modo de ejemplo)
  const OCCUPIED = new Set([
    "B3", "B4", "C6", "C7", "C8", "D2", "E5", "E6", "F9", "G1", "G2", "H7"
  ]);

  state.seats = [];

  function buildSeatMap(){
    const map = document.getElementById('seatMap');
    map.innerHTML = '';

    ROWS.forEach(letter => {
      const row = document.createElement('div');
      row.className = 'seat-row';

      const rowLabel = document.createElement('span');
      rowLabel.className = 'row-letter';
      rowLabel.textContent = letter;
      row.appendChild(rowLabel);

      for(let side = 0; side < 2; side++){
        for(let i = 1; i <= SEATS_PER_SIDE; i++){
          const num = side === 0 ? i : SEATS_PER_SIDE + i;
          const id = `${letter}${num}`;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'seat';
          btn.dataset.seat = id;

          if(OCCUPIED.has(id)){
            btn.classList.add('occupied');
            btn.disabled = true;
          }
          if(state.seats.includes(id)){
            btn.classList.add('selected');
          }

          btn.addEventListener('click', () => toggleSeat(id));
          row.appendChild(btn);
        }
        if(side === 0){
          const gap = document.createElement('span');
          gap.className = 'seat gap';
          row.appendChild(gap);
        }
      }

      map.appendChild(row);
    });
  }

  function toggleSeat(id){
    const idx = state.seats.indexOf(id);
    if(idx === -1){
      state.seats.push(id);
    } else {
      state.seats.splice(idx, 1);
    }
    buildSeatMap();
    refreshSeatsUI();
  }

  function refreshSeatsUI(){
    document.getElementById('seatsPicked').textContent =
      state.seats.length ? state.seats.sort().join(', ') : 'Ninguna';
    document.getElementById('continuarButacasBtn').disabled = state.seats.length === 0;
  }

  function buildSummaryStrip(){
    const strip = document.getElementById('summaryStrip');
    strip.innerHTML = `
      <span class="summary-chip"><b>${state.cine}</b></span>
      <span class="summary-chip">Formato: <b>${state.formato}</b></span>
      <span class="summary-chip">Idioma: <b>${state.idioma}</b></span>
    `;
  }

  // ---------- Cambio entre vistas ----------

  function goToButacas(){
    buildSummaryStrip();
    buildSeatMap();
    refreshSeatsUI();
    document.getElementById('viewHorarios').hidden = true;
    document.getElementById('viewButacas').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function goToHorarios(){
    document.getElementById('viewButacas').hidden = true;
    document.getElementById('viewHorarios').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  document.getElementById('continuarBtn').addEventListener('click', () => {
    if(!document.getElementById('continuarBtn').disabled){
      goToButacas();
    }
  });

  document.getElementById('backBtn').addEventListener('click', goToHorarios);

  document.getElementById('continuarButacasBtn').addEventListener('click', () => {
    if(!document.getElementById('continuarButacasBtn').disabled){
      goToSnacks();
    }
  });

  // ---------- Vista: snacks ----------
  // Precios de referencia en base a valores publicados por Cinemark Argentina (candy bar);
  // pueden variar según el complejo y la fecha.

  const COMBOS = [
    { id: "combo_chico", icon: "🍿", name: "Combo Chico", desc: "Bolsa de pochoclos + gaseosa chica", price: 12900 },
    { id: "combo_mediano", icon: "🍿", name: "Combo Mediano", desc: "Balde de pochoclos + gaseosa mediana", price: 17900 },
    { id: "combo_mega", icon: "🍿", name: "Combo Mega", desc: "Balde grande de pochoclos + gaseosa grande + golosina", price: 22900 },
    { id: "combo_nachos", icon: "🧀", name: "Combo Nachos", desc: "Nachos con queso + vaso reutilizable con gaseosa", price: 26900 }
  ];

  const INDIVIDUALES = [
    { id: "pochoclos_bolsa", icon: "🍿", name: "Pochoclos (bolsa)", desc: "Dulces o salados", price: 7700 },
    { id: "pochoclos_balde", icon: "🍿", name: "Pochoclos (balde)", desc: "Dulces o salados", price: 9300 },
    { id: "gaseosa", icon: "🥤", name: "Gaseosa", desc: "Línea Coca-Cola, tamaño grande", price: 4500 },
    { id: "agua", icon: "💧", name: "Agua mineral", desc: "500 ml", price: 3800 }
  ];

  const ALL_SNACKS = [...COMBOS, ...INDIVIDUALES];

  state.snacks = {}; // { id: cantidad }

  function currency(n){
    return '$' + n.toLocaleString('es-AR');
  }

  function buildSnackCard(item){
    const card = document.createElement('div');
    const qty = state.snacks[item.id] || 0;
    card.className = 'snack-card' + (qty > 0 ? ' active' : '');
    card.innerHTML = `
      <div class="snack-icon">${item.icon}</div>
      <div class="snack-info">
        <div class="snack-name">${item.name}</div>
        <div class="snack-desc">${item.desc}</div>
        <div class="snack-price">${currency(item.price)}</div>
      </div>
      <div class="qty-stepper">
        <button type="button" class="qty-btn minus" ${qty === 0 ? 'disabled' : ''}>–</button>
        <span class="qty-value">${qty}</span>
        <button type="button" class="qty-btn plus">+</button>
      </div>
    `;
    card.querySelector('.minus').addEventListener('click', () => changeQty(item.id, -1));
    card.querySelector('.plus').addEventListener('click', () => changeQty(item.id, 1));
    return card;
  }

  function buildSnacksLists(){
    const combosWrap = document.getElementById('snackCombos');
    const indWrap = document.getElementById('snackIndividuales');
    combosWrap.innerHTML = '';
    indWrap.innerHTML = '';
    COMBOS.forEach(item => combosWrap.appendChild(buildSnackCard(item)));
    INDIVIDUALES.forEach(item => indWrap.appendChild(buildSnackCard(item)));
  }

  function changeQty(id, delta){
    const current = state.snacks[id] || 0;
    const next = Math.max(0, current + delta);
    if(next === 0){
      delete state.snacks[id];
    } else {
      state.snacks[id] = next;
    }
    buildSnacksLists();
    refreshSnacksTotal();
  }

  function refreshSnacksTotal(){
    let total = 0;
    Object.keys(state.snacks).forEach(id => {
      const item = ALL_SNACKS.find(s => s.id === id);
      total += item.price * state.snacks[id];
    });
    document.getElementById('snacksTotal').textContent = currency(total);
  }

  function goToSnacks(){
    buildSnacksLists();
    refreshSnacksTotal();
    document.getElementById('viewButacas').hidden = true;
    document.getElementById('viewSnacks').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function goToButacasFromSnacks(){
    document.getElementById('viewSnacks').hidden = true;
    document.getElementById('viewButacas').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  document.getElementById('backBtnSnacks').addEventListener('click', goToButacasFromSnacks);

  document.getElementById('skipSnacksBtn').addEventListener('click', () => {
    state.snacks = {};
    buildSnacksLists();
    refreshSnacksTotal();
    goToPago();
  });

  document.getElementById('continuarSnacksBtn').addEventListener('click', () => {
    goToPago();
  });

  // ---------- Vista: pago ----------

  const PAY_METHODS = {
    tarjeta: () => `
      <div class="pay-form">
        <div class="field">
          <label>Nombre y apellido</label>
          <input type="text" placeholder="Como figura en la tarjeta">
        </div>
        <div class="field">
          <label>Número de tarjeta</label>
          <input type="text" placeholder="0000 0000 0000 0000" maxlength="19">
        </div>
        <div class="field-row">
          <div class="field">
            <label>Vencimiento</label>
            <input type="text" placeholder="MM/AA" maxlength="5">
          </div>
          <div class="field">
            <label>CVV</label>
            <input type="text" placeholder="123" maxlength="4">
          </div>
        </div>
        <div class="field">
          <label>Tipo</label>
          <select>
            <option>Débito</option>
            <option>Crédito</option>
          </select>
        </div>
      </div>
    `,
    mercadopago: () => `
      <div class="pay-form">
        <div class="field">
          <label>Email o teléfono asociado a Mercado Pago</label>
          <input type="text" placeholder="tucorreo@email.com">
        </div>
        <p class="pay-note">Vas a confirmar el pago desde tu cuenta de <strong>Mercado Pago</strong>.</p>
      </div>
    `,
    efectivo: () => `
      <div class="pay-form">
        <p class="pay-note">Pagás en <strong>efectivo</strong> al retirar tus entradas en boletería. Te reservamos la compra por 30 minutos.</p>
      </div>
    `
  };

  function selectPayMethod(method){
    state.metodoPago = method;
    document.querySelectorAll('.pay-method').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.method === method);
    });
    document.getElementById('payFormWrap').innerHTML = PAY_METHODS[method]();
    document.getElementById('confirmarCompraBtn').disabled = false;
  }

  document.querySelectorAll('.pay-method').forEach(btn => {
    btn.addEventListener('click', () => selectPayMethod(btn.dataset.method));
  });

  function buildOrderSummary(){
    const wrap = document.getElementById('orderLines');
    const formato = FORMATOS.find(f => f.name === state.formato);
    const entradasTotal = formato.price * state.seats.length;

    let snacksTotal = 0;
    const snackLines = Object.keys(state.snacks).map(id => {
      const item = ALL_SNACKS.find(s => s.id === id);
      const qty = state.snacks[id];
      const subtotal = item.price * qty;
      snacksTotal += subtotal;
      return `<div class="order-line"><span class="oname">${qty}x ${item.name}</span><span class="ovalue">${currency(subtotal)}</span></div>`;
    }).join('');

    wrap.innerHTML = `
      <div class="order-line"><span class="oname">Cine</span><span class="ovalue">${state.cine}</span></div>
      <div class="order-line"><span class="oname">Función</span><span class="ovalue">${state.formato} · ${state.idioma}</span></div>
      <div class="order-line"><span class="oname">Butacas (${state.seats.length})</span><span class="ovalue">${state.seats.slice().sort().join(', ')}</span></div>
      <div class="order-line subtotal-only"><span class="oname">Entradas</span><span class="ovalue">${currency(entradasTotal)}</span></div>
      ${snackLines || '<div class="order-line"><span class="oname">Snacks</span><span class="ovalue">Sin snacks</span></div>'}
    `;

    state.entradasTotal = entradasTotal;
    state.snacksTotal = snacksTotal;
    state.total = entradasTotal + snacksTotal;

    document.getElementById('orderTotal').textContent = currency(state.total);
  }

  function goToPago(){
    buildOrderSummary();
    document.getElementById('payFormWrap').innerHTML = '';
    document.getElementById('confirmarCompraBtn').disabled = true;
    document.querySelectorAll('.pay-method').forEach(btn => btn.classList.remove('selected'));
    state.metodoPago = null;
    document.getElementById('viewSnacks').hidden = true;
    document.getElementById('viewPago').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function goToSnacksFromPago(){
    document.getElementById('viewPago').hidden = true;
    document.getElementById('viewSnacks').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  document.getElementById('backBtnPago').addEventListener('click', goToSnacksFromPago);

  // ---------- Confirmación de compra (overlay) ----------

  function showOverlay(){
    document.getElementById('overlayConfirmacion').classList.add('show');
  }

  function hideOverlay(){
    document.getElementById('overlayConfirmacion').classList.remove('show');
  }

  document.getElementById('confirmarCompraBtn').addEventListener('click', () => {
    if(!document.getElementById('confirmarCompraBtn').disabled){
      // Genera un numero de orden simple para la factura, solo a modo de ejemplo
      state.orderId = 'CF-' + Math.floor(100000 + Math.random() * 900000);
      state.orderDate = new Date();
      if(typeof window.__logActivity === 'function'){
        window.__logActivity('compra', `Compraste ${state.seats.length} entrada(s) en ${state.cine} · Orden ${state.orderId}`);
      }
      showOverlay();
    }
  });

  // ---------- Vista: factura ----------

  const METODO_LABEL = {
    tarjeta: "Tarjeta",
    mercadopago: "Mercado Pago",
    efectivo: "Efectivo"
  };

  function buildReceipt(){
    const content = document.getElementById('receiptContent');
    const fecha = state.orderDate.toLocaleDateString('es-AR');
    const hora = state.orderDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const snackRows = Object.keys(state.snacks).map(id => {
      const item = ALL_SNACKS.find(s => s.id === id);
      const qty = state.snacks[id];
      return `<div class="receipt-row"><span class="rname">${qty}x ${item.name}</span><span>${currency(item.price * qty)}</span></div>`;
    }).join('');

    content.innerHTML = `
      <div class="receipt-head">
        <div class="brand">CINE<span class="accent">TICKET</span></div>
        <div class="meta">Orden ${state.orderId} · ${fecha} ${hora}hs</div>
      </div>

      <div class="receipt-section">
        <p class="receipt-label">Cine</p>
        <div class="receipt-row"><span class="rname">Complejo</span><span>${state.cine}</span></div>
        <div class="receipt-row"><span class="rname">Función</span><span>${state.formato} · ${state.idioma}</span></div>
        <div class="receipt-row"><span class="rname">Butacas</span><span>${state.seats.slice().sort().join(', ')}</span></div>
      </div>

      <div class="receipt-section">
        <p class="receipt-label">Detalle</p>
        <div class="receipt-row"><span class="rname">Entradas (${state.seats.length})</span><span>${currency(state.entradasTotal)}</span></div>
        ${snackRows || '<div class="receipt-row"><span class="rname">Snacks</span><span>—</span></div>'}
      </div>

      <div class="receipt-section">
        <p class="receipt-label">Pago</p>
        <div class="receipt-row"><span class="rname">Método</span><span>${METODO_LABEL[state.metodoPago]}</span></div>
      </div>

      <div class="receipt-total">
        <span class="label">Total pagado</span>
        <span class="amount">${currency(state.total)}</span>
      </div>

      <div class="receipt-thanks">Gracias por tu compra. Disfrutá la función 🎬</div>
    `;
  }

  document.getElementById('verFacturaBtn').addEventListener('click', () => {
    hideOverlay();
    buildReceipt();
    document.getElementById('viewPago').hidden = true;
    document.getElementById('viewFactura').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  document.getElementById('volverInicioBtn').addEventListener('click', () => {
    // Reinicia el estado para empezar una nueva compra
    state.cine = null;
    state.formato = null;
    state.idioma = null;
    state.seats = [];
    state.snacks = {};
    state.metodoPago = null;
    refreshUI();
    document.getElementById('viewFactura').hidden = true;
    document.getElementById('viewHorarios').hidden = false;
    // Vuelve a la home de TicketCine
    document.getElementById('horarios-app').hidden = true;
    const searchAppEl = document.getElementById('search-app');
    if(searchAppEl) searchAppEl.hidden = true;
    document.getElementById('ticketcine-home').hidden = false;
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    const inicioBtn = document.querySelector('.bottom-nav-item[data-section="inicio"]');
    if(inicioBtn) inicioBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

// ============================================================
// Cuenta de usuario: iniciar sesión / crear cuenta / perfil
// Menú lateral: navegación, configuración, ayuda, historial
// Todo se guarda en localStorage (no hay backend real).
// ============================================================
(function(){

  // ---------- Utilidades de guardado ----------
  function readJSON(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }
  function writeJSON(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){ /* almacenamiento no disponible */ }
  }

  function getUsers(){ return readJSON('tc_users', []); }
  function saveUsers(list){ writeJSON('tc_users', list); }
  function getSession(){ return readJSON('tc_session', null); }
  function setSession(email){ writeJSON('tc_session', email); }
  function clearSession(){ try{ localStorage.removeItem('tc_session'); }catch(e){} }

  // ---------- Historial de actividad ----------
  function logActivity(type, label){
    const list = readJSON('tc_activity', []);
    list.unshift({ type, label, date: new Date().toISOString() });
    writeJSON('tc_activity', list.slice(0, 40));
  }
  window.__logActivity = logActivity;

  function formatActivityDate(iso){
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR') + ' · ' + d.toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit' });
  }

  // ============================================================
  // Modal de Cuenta
  // ============================================================
  const AVATAR_OPTIONS = ['🎬','🍿','🎟️','🎭','👻','⭐','📽️','🛸'];

  const userOverlay = document.getElementById('userOverlay');
  const userBackdrop = document.getElementById('userBackdrop');
  const userCloseBtn = document.getElementById('userCloseBtn');
  const userBtn = document.getElementById('userBtn');

  const viewLogin = document.getElementById('userViewLogin');
  const viewRegister = document.getElementById('userViewRegister');
  const viewProfile = document.getElementById('userViewProfile');

  let selectedAvatar = AVATAR_OPTIONS[0];

  function showUserView(view){
    [viewLogin, viewRegister, viewProfile].forEach(v => { if(v) v.hidden = (v !== view); });
  }

  function openUserOverlay(){
    if(!userOverlay) return;
    const session = getSession();
    if(session){
      const users = getUsers();
      const u = users.find(x => x.email === session);
      if(u) renderProfile(u);
      showUserView(viewProfile);
    } else {
      showUserView(viewLogin);
    }
    userOverlay.classList.add('active');
  }
  function closeUserOverlay(){
    if(userOverlay) userOverlay.classList.remove('active');
  }

  if(userBtn) userBtn.addEventListener('click', openUserOverlay);
  if(userCloseBtn) userCloseBtn.addEventListener('click', closeUserOverlay);
  if(userBackdrop) userBackdrop.addEventListener('click', closeUserOverlay);

  // Mostrar/ocultar contraseña
  document.querySelectorAll('.user-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if(!target) return;
      target.type = target.type === 'password' ? 'text' : 'password';
    });
  });

  // ---------- Avatar ----------
  const avatarOptionsEl = document.getElementById('avatarOptions');
  const avatarPreviewEl = document.getElementById('avatarPreview');
  if(avatarOptionsEl){
    AVATAR_OPTIONS.forEach((emoji, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'avatar-option' + (i === 0 ? ' selected' : '');
      b.textContent = emoji;
      b.addEventListener('click', () => {
        selectedAvatar = emoji;
        if(avatarPreviewEl) avatarPreviewEl.textContent = emoji;
        avatarOptionsEl.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
        b.classList.add('selected');
      });
      avatarOptionsEl.appendChild(b);
    });
  }

  // ---------- Complejo de preferencia (reusa CINES de Horarios) ----------
  const regComplejo = document.getElementById('regComplejo');
  if(regComplejo && typeof CINES !== 'undefined'){
    CINES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.nombre || c.name || c;
      opt.textContent = c.nombre || c.name || c;
      regComplejo.appendChild(opt);
    });
  }

  // ---------- Login ----------
  const goRegisterBtn = document.getElementById('goRegisterBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const loginError = document.getElementById('loginError');

  if(goRegisterBtn) goRegisterBtn.addEventListener('click', () => showUserView(viewRegister));
  if(backToLoginBtn) backToLoginBtn.addEventListener('click', () => showUserView(viewLogin));

  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  if(forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', () => {
    if(loginError){ loginError.textContent = 'Es una demo: no enviamos correos reales. Si te registraste acá, tu contraseña quedó guardada en este navegador.'; loginError.hidden = false; }
  });

  if(loginSubmitBtn) loginSubmitBtn.addEventListener('click', () => {
    const email = (document.getElementById('loginEmail').value || '').trim().toLowerCase();
    const pass = document.getElementById('loginPassword').value || '';
    if(loginError) loginError.hidden = true;

    if(!email || !pass){
      if(loginError){ loginError.textContent = 'Completá tu correo y contraseña.'; loginError.hidden = false; }
      return;
    }
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if(!user || user.password !== pass){
      if(loginError){ loginError.textContent = 'Correo o contraseña incorrectos.'; loginError.hidden = false; }
      return;
    }
    setSession(user.email);
    logActivity('sesion', 'Iniciaste sesión');
    renderProfile(user);
    showUserView(viewProfile);
    updateUserButton();
  });

  // ---------- Registro ----------
  const registerSubmitBtn = document.getElementById('registerSubmitBtn');
  const registerError = document.getElementById('registerError');

  if(registerSubmitBtn) registerSubmitBtn.addEventListener('click', () => {
    const nombre = document.getElementById('regNombre').value.trim();
    const apellido = document.getElementById('regApellido').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const nacimiento = document.getElementById('regNacimiento').value;
    const telefono = document.getElementById('regTelefono').value.trim();
    const complejo = document.getElementById('regComplejo').value;
    const genero = document.getElementById('regGenero').value;
    const pass = document.getElementById('regPassword').value;
    const passConfirm = document.getElementById('regPasswordConfirm').value;
    const terms = document.getElementById('regTerms').checked;

    if(registerError) registerError.hidden = true;

    if(!nombre || !apellido || !email || !nacimiento || !telefono || !complejo || !genero || !pass || !passConfirm){
      if(registerError){ registerError.textContent = 'Completá todos los campos obligatorios.'; registerError.hidden = false; }
      return;
    }
    if(pass !== passConfirm){
      if(registerError){ registerError.textContent = 'Las contraseñas no coinciden.'; registerError.hidden = false; }
      return;
    }
    if(pass.length < 6){
      if(registerError){ registerError.textContent = 'La contraseña debe tener al menos 6 caracteres.'; registerError.hidden = false; }
      return;
    }
    if(!terms){
      if(registerError){ registerError.textContent = 'Tenés que aceptar los Términos y Condiciones.'; registerError.hidden = false; }
      return;
    }

    const users = getUsers();
    if(users.some(u => u.email === email)){
      if(registerError){ registerError.textContent = 'Ya existe una cuenta con ese correo.'; registerError.hidden = false; }
      return;
    }

    const newUser = { nombre, apellido, email, nacimiento, telefono, complejo, genero, pass, password: pass, avatar: selectedAvatar };
    users.push(newUser);
    saveUsers(users);
    setSession(email);
    logActivity('cuenta', 'Creaste tu cuenta en TicketCine');

    renderProfile(newUser);
    showUserView(viewProfile);
    updateUserButton();
  });

  // ---------- Perfil / logout ----------
  function renderProfile(user){
    const avatarEl = document.getElementById('profileAvatar');
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    if(avatarEl) avatarEl.textContent = user.avatar || '🎬';
    if(nameEl) nameEl.textContent = `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.email;
    if(emailEl) emailEl.textContent = user.email;
  }

  function updateUserButton(){
    if(!userBtn) return;
    const session = getSession();
    if(session){
      const users = getUsers();
      const u = users.find(x => x.email === session);
      userBtn.textContent = (u && u.avatar) ? u.avatar : '👤';
    } else {
      userBtn.textContent = '👤';
    }
  }
  updateUserButton();

  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn) logoutBtn.addEventListener('click', () => {
    clearSession();
    logActivity('sesion', 'Cerraste sesión');
    updateUserButton();
    showUserView(viewLogin);
  });

  // ============================================================
  // Menú lateral (hamburguesa)
  // ============================================================
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sideDrawerOverlay = document.getElementById('sideDrawerOverlay');
  const sideDrawerBackdrop = document.getElementById('sideDrawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');

  function openDrawer(){ if(sideDrawerOverlay) sideDrawerOverlay.classList.add('active'); }
  function closeDrawer(){ if(sideDrawerOverlay) sideDrawerOverlay.classList.remove('active'); }

  if(hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
  if(drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if(sideDrawerBackdrop) sideDrawerBackdrop.addEventListener('click', closeDrawer);

  // Navegación principal del drawer: reusa los mismos botones de la barra inferior
  document.querySelectorAll('.drawer-item[data-drawer-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeDrawer();
      const section = btn.dataset.drawerNav;
      const navBtn = document.querySelector(`.bottom-nav-item[data-section="${section}"]`);
      if(navBtn) navBtn.click();
    });
  });

  // ---------- Paneles genéricos (Configuración / Ayuda / Historial) ----------
  function openPanel(id){
    closeDrawer();
    const panel = document.getElementById(id);
    if(panel) panel.classList.add('active');
  }
  function closePanel(id){
    const panel = document.getElementById(id);
    if(panel) panel.classList.remove('active');
  }
  document.querySelectorAll('[data-close-panel]').forEach(el => {
    el.addEventListener('click', () => closePanel(el.dataset.closePanel));
  });

  const drawerSettingsBtn = document.getElementById('drawerSettingsBtn');
  const drawerHelpBtn = document.getElementById('drawerHelpBtn');
  const drawerHistoryBtn = document.getElementById('drawerHistoryBtn');

  if(drawerSettingsBtn) drawerSettingsBtn.addEventListener('click', () => openPanel('settingsPanel'));
  if(drawerHelpBtn) drawerHelpBtn.addEventListener('click', () => { openPanel('helpPanel'); buildFAQ(); });
  if(drawerHistoryBtn) drawerHistoryBtn.addEventListener('click', () => { openPanel('historyPanel'); buildHistory(); });

  // ---------- Configuración ----------
  const settingLang = document.getElementById('settingLang');
  const settingDarkMode = document.getElementById('settingDarkMode');
  const settingNotifications = document.getElementById('settingNotifications');
  const settingStatus = document.getElementById('settingStatus');

  if(settingLang){
    settingLang.value = readJSON('tc_lang', 'es');
    settingLang.addEventListener('change', () => {
      writeJSON('tc_lang', settingLang.value);
      if(settingStatus) settingStatus.textContent = settingLang.value === 'es'
        ? 'Preferencia guardada. Por ahora el contenido del sitio sigue en Español.'
        : 'Preference saved. For now, all site content stays in Spanish.';
    });
  }

  if(settingDarkMode){
    const isLight = readJSON('tc_theme', 'dark') === 'light';
    settingDarkMode.checked = !isLight; // "modo oscuro" activado = checked
    document.documentElement.classList.toggle('light-theme', isLight);
    settingDarkMode.addEventListener('change', () => {
      const dark = settingDarkMode.checked;
      document.documentElement.classList.toggle('light-theme', !dark);
      writeJSON('tc_theme', dark ? 'dark' : 'light');
      if(settingStatus) settingStatus.textContent = dark ? 'Modo oscuro activado.' : 'Modo claro activado.';
    });
  }

  if(settingNotifications){
    settingNotifications.checked = readJSON('tc_notifications', false);
    settingNotifications.addEventListener('change', () => {
      writeJSON('tc_notifications', settingNotifications.checked);
      if(!settingNotifications.checked){
        if(settingStatus) settingStatus.textContent = 'Notificaciones desactivadas.';
        return;
      }
      if(typeof Notification === 'undefined'){
        if(settingStatus) settingStatus.textContent = 'Tu navegador no soporta notificaciones.';
        return;
      }
      Notification.requestPermission().then(permission => {
        if(settingStatus){
          settingStatus.textContent = permission === 'granted'
            ? 'Notificaciones activadas.'
            : 'Activalas también desde los permisos del navegador para recibir avisos.';
        }
      }).catch(() => {
        if(settingStatus) settingStatus.textContent = 'No pudimos activar las notificaciones.';
      });
    });
  }

  // ---------- Ayuda y soporte: FAQ ----------
  const FAQ_ITEMS = [
    { q: '¿Cómo compro entradas?', a: 'Elegí una película, tocá un horario y seguí los pasos: butacas, snacks y pago. Al final te mostramos la factura.' },
    { q: '¿Puedo cancelar mi compra?', a: 'Esta es una demo: las compras son simuladas y no se procesan pagos reales, así que no hay cancelaciones que gestionar.' },
    { q: '¿Qué métodos de pago aceptan?', a: 'En esta demo podés simular el pago con tarjeta, Mercado Pago o efectivo.' },
    { q: '¿Cómo cambio mi contraseña?', a: 'Por ahora no hay un flujo de cambio de contraseña. Si olvidaste la tuya, podés crear una cuenta nueva.' },
    { q: '¿Mis datos quedan guardados en algún servidor?', a: 'No. Todo se guarda únicamente en el almacenamiento local de tu navegador (localStorage).' },
  ];
  const faqList = document.getElementById('faqList');
  let faqBuilt = false;
  function buildFAQ(){
    if(faqBuilt || !faqList) return;
    faqBuilt = true;
    FAQ_ITEMS.forEach(item => {
      const wrap = document.createElement('div');
      wrap.className = 'faq-item';
      wrap.innerHTML = `
        <button type="button" class="faq-question">${item.q}</button>
        <div class="faq-answer">${item.a}</div>
      `;
      wrap.querySelector('.faq-question').addEventListener('click', () => wrap.classList.toggle('open'));
      faqList.appendChild(wrap);
    });
  }

  // ---------- Reportar un problema ----------
  const reportSubmitBtn = document.getElementById('reportSubmitBtn');
  const reportText = document.getElementById('reportText');
  const reportStatus = document.getElementById('reportStatus');
  if(reportSubmitBtn) reportSubmitBtn.addEventListener('click', () => {
    const text = (reportText.value || '').trim();
    if(!text){
      if(reportStatus) reportStatus.textContent = 'Escribí una breve descripción antes de enviar.';
      return;
    }
    const reports = readJSON('tc_reports', []);
    reports.unshift({ text, date: new Date().toISOString() });
    writeJSON('tc_reports', reports.slice(0, 20));
    logActivity('reporte', 'Enviaste un reporte de un problema');
    reportText.value = '';
    if(reportStatus) reportStatus.textContent = '¡Gracias! Recibimos tu reporte (simulado).';
  });

  // ---------- Historial de actividad ----------
  const historyList = document.getElementById('historyList');
  function buildHistory(){
    if(!historyList) return;
    const items = readJSON('tc_activity', []);
    historyList.innerHTML = '';
    if(items.length === 0){
      const empty = document.createElement('div');
      empty.className = 'history-empty';
      empty.textContent = 'Todavía no hay actividad. Mirá un tráiler o hacé una compra para verla acá.';
      historyList.appendChild(empty);
      return;
    }
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.innerHTML = `<div class="h-label">${item.label}</div><div class="h-date">${formatActivityDate(item.date)}</div>`;
      historyList.appendChild(row);
    });
  }

})();


// ============================================================
// Filtros de la home: Elegí cine / Elegí película / Formatos /
// Idioma / Otras opciones — y botón de volver en Horarios
// ============================================================
(function(){

  function closeAllFilterDropdowns(except){
    document.querySelectorAll('.filter-dropdown').forEach(dd => { if(dd !== except) dd.hidden = true; });
  }

  document.addEventListener('click', (e) => {
    if(!e.target.closest('.filter-left, .filter-right, .subfilter-wrap')){
      closeAllFilterDropdowns();
    }
  });

  function makeItem(label, onClick){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'filter-dropdown-item';
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function setupDropdown(btnId, dropdownId, buildItems){
    const btn = document.getElementById(btnId);
    const dropdown = document.getElementById(dropdownId);
    if(!btn || !dropdown) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = !dropdown.hidden;
      closeAllFilterDropdowns(dropdown);
      if(wasOpen){ dropdown.hidden = true; return; }
      dropdown.innerHTML = '';
      buildItems(dropdown);
      dropdown.hidden = false;
    });
  }

  // ---------- Elegí cine (reusa la lista de cines de Horarios) ----------
  const cineLabel = document.getElementById('filterCineLabel');
  const cineBtn = document.getElementById('filterCineBtn');
  setupDropdown('filterCineBtn', 'filterCineDropdown', (dropdown) => {
    const cines = (typeof CINES !== 'undefined') ? CINES : [];
    if(cines.length === 0){
      dropdown.appendChild(makeItem('No hay cines cargados', () => {}));
      return;
    }
    cines.forEach(c => {
      const name = c.name || c.nombre || c;
      dropdown.appendChild(makeItem(name, () => {
        if(cineLabel) cineLabel.textContent = name;
        if(cineBtn) cineBtn.classList.add('has-value');
        dropdown.hidden = true;
      }));
    });
  });

  // ---------- Elegí película (reusa el carrusel + la cartelera) ----------
  const peliculaLabel = document.getElementById('filterPeliculaLabel');
  const peliculaBtn = document.getElementById('filterPeliculaBtn');
  setupDropdown('filterPeliculaBtn', 'filterPeliculaDropdown', (dropdown) => {
    const movies = Array.isArray(window.__allMovies) ? window.__allMovies : [];
    if(movies.length === 0){
      dropdown.appendChild(makeItem('No hay películas cargadas', () => {}));
      return;
    }
    movies.forEach(m => {
      dropdown.appendChild(makeItem(m.title, () => {
        if(peliculaLabel) peliculaLabel.textContent = m.title;
        if(peliculaBtn) peliculaBtn.classList.add('has-value');
        dropdown.hidden = true;
        // Elegir una película abre directamente su tráiler + horarios,
        // el mismo protocolo que un póster de la home.
        if(typeof window.__openMoviePlayer === 'function') window.__openMoviePlayer(m, peliculaBtn);
      }));
    });
  });

  // ---------- Simula que la cartelera "reacciona" a los filtros ----------
  let originalGalleryOrder = null;
  function shuffleGallery(){
    const grid = document.getElementById('gallery-grid');
    if(!grid) return;
    const cards = Array.from(grid.children);
    if(cards.length < 2) return;
    if(!originalGalleryOrder) originalGalleryOrder = cards.slice();
    grid.classList.add('shuffling');
    setTimeout(() => {
      for(let i = cards.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
      cards.forEach(c => grid.appendChild(c));
      grid.classList.remove('shuffling');
    }, 220);
  }
  function restoreGalleryOrder(){
    const grid = document.getElementById('gallery-grid');
    if(!grid || !originalGalleryOrder) return;
    grid.classList.add('shuffling');
    setTimeout(() => {
      originalGalleryOrder.forEach(c => grid.appendChild(c));
      grid.classList.remove('shuffling');
    }, 220);
  }

  // ---------- Formatos / Idioma / Otras opciones ----------
  function setupSimpleFilter(btnId, dropdownId, options){
    const btn = document.getElementById(btnId);
    if(!btn) return;
    const baseLabel = btn.textContent.replace('▾', '').trim();
    setupDropdown(btnId, dropdownId, (dropdown) => {
      options.forEach(opt => {
        dropdown.appendChild(makeItem(opt, () => {
          btn.textContent = opt + ' ▾';
          btn.classList.add('has-value');
          dropdown.hidden = true;
          shuffleGallery();
        }));
      });
      const clearItem = makeItem('Quitar filtro', () => {
        btn.textContent = baseLabel + ' ▾';
        btn.classList.remove('has-value');
        dropdown.hidden = true;
        restoreGalleryOrder();
      });
      clearItem.style.color = 'var(--muted)';
      dropdown.appendChild(clearItem);
    });
  }

  setupSimpleFilter('subfilterFormatosBtn', 'subfilterFormatosDropdown', ['2D', '3D', '4DX', 'IMAX']);
  setupSimpleFilter('subfilterIdiomaBtn', 'subfilterIdiomaDropdown', ['Subtitulada', 'Doblada']);
  setupSimpleFilter('subfilterOtrasBtn', 'subfilterOtrasDropdown', ['Accesibilidad auditiva', 'Accesibilidad visual', 'Salas premium']);

  // ---------- Título TICKETCINE: las letras saltan al tocarlo ----------
  const brandEl = document.querySelector('.site-header .brand');
  if(brandEl){
    const text = brandEl.textContent;
    brandEl.textContent = '';
    brandEl.style.cursor = 'pointer';
    const letterEls = [...text].map(ch => {
      const span = document.createElement('span');
      span.className = 'brand-letter';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      brandEl.appendChild(span);
      return span;
    });
    brandEl.addEventListener('click', () => {
      letterEls.forEach(el => el.classList.remove('brand-bounce'));
      void brandEl.offsetWidth; // fuerza el reflow para poder repetir la animación
      letterEls.forEach((el, i) => {
        el.style.animationDelay = (i * 0.05) + 's';
        el.classList.add('brand-bounce');
      });
    });
  }

  // ---------- Botón "Volver" en la pantalla HORARIOS ----------
  const backBtnHorarios = document.getElementById('backBtnHorarios');
  if(backBtnHorarios) backBtnHorarios.addEventListener('click', () => {
    const horariosApp = document.getElementById('horarios-app');
    const searchApp = document.getElementById('search-app');
    const home = document.getElementById('ticketcine-home');
    if(horariosApp) horariosApp.hidden = true;
    if(searchApp) searchApp.hidden = true;
    if(home) home.hidden = false;
    document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
    const inicioBtn = document.querySelector('.bottom-nav-item[data-section="inicio"]');
    if(inicioBtn) inicioBtn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

})();
