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

});


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
    document.getElementById('ticketcine-home').hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
