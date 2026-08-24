/* script.js - Reservation logic; loader timing reduced to be less obtrusive (min 800ms, fallback 2000ms) */
document.addEventListener('DOMContentLoaded', ()=> {
  // --- Loader handling (splash with logo) ---
  const loader = document.getElementById('loader-overlay');
  const minDisplay = 800; // minimum ms the loader stays visible (800ms)
  const maxFallback = 2000; // maximum ms to wait before hiding loader (2000ms)
  const startTime = performance.now();
  let loaderHidden = false;

  function hideLoaderImmediate(){
    if(!loader || loaderHidden) return;
    loaderHidden = true;
    loader.classList.add('loaded');
    // clear display after CSS transition
    setTimeout(()=>{ if(loader) loader.style.display = 'none'; }, 600);
    if(fallbackTimer) clearTimeout(fallbackTimer);
  }

  function hideLoader(){
    if(!loader) return;
    const elapsed = performance.now() - startTime;
    const wait = Math.max(0, minDisplay - elapsed);
    setTimeout(hideLoaderImmediate, wait);
  }

  // Hide loader on full window load, but enforce min display time
  window.addEventListener('load', hideLoader);

  // Fallback: if load takes too long, hide after maxFallback
  const fallbackTimer = setTimeout(()=>{ if(loader && !loaderHidden) hideLoaderImmediate(); }, maxFallback);
  // --- End loader handling ---

  // Reservation app logic
  const movies = [
    { id:1, title:'La Aventura Espacial', desc:'Una odisea por el sistema solar llena de emoción y descubrimientos.', img:'https://picsum.photos/seed/space/400/240', times:['12:00','15:30','18:00','21:00'] },
    { id:2, title:'Amor en la Ciudad', desc:'Comedia romántica sobre segundas oportunidades.', img:'https://picsum.photos/seed/romance/400/240', times:['11:00','14:00','17:00','20:30'] },
    { id:3, title:'El Misterio del Lago', desc:'Thriller psicológico que te mantendrá en tensión hasta el final.', img:'https://picsum.photos/seed/mystery/400/240', times:['13:00','16:15','19:45'] },
    { id:4, title:'Comedia Nocturna', desc:'Risas y enredos en una comedia familiar.', img:'https://picsum.photos/seed/comedy/400/240', times:['10:30','13:45','16:00','19:00'] }
  ];

  let selectedMovie = null; let selectedTime = null;
  const moviesContainer = document.getElementById('movies-container');
  const selectedMovieEl = document.getElementById('selected-movie');
  const showtimesEl = document.getElementById('showtimes');
  const quantityEl = document.getElementById('quantity');
  const confirmBtn = document.getElementById('confirm-btn');
  const successMessage = document.getElementById('success-message');
  const confirmationText = document.getElementById('confirmation-text');

  function renderMovies(){
    moviesContainer.innerHTML = '';
    movies.forEach(m => {
      const card = document.createElement('div'); card.className='card';
      card.innerHTML = `<img src="${m.img}" alt="${m.title}"><h3>${m.title}</h3><p>${m.desc}</p>`;
      const actions = document.createElement('div'); actions.className='actions';
      const selectBtn = document.createElement('button'); selectBtn.className='btn'; selectBtn.textContent='Seleccionar';
      selectBtn.addEventListener('click', ()=> selectMovie(m.id));
      actions.appendChild(selectBtn); card.appendChild(actions); moviesContainer.appendChild(card);
    });
  }

  function selectMovie(id){ selectedMovie = movies.find(x=>x.id===id); selectedTime=null; selectedMovieEl.textContent = selectedMovie? selectedMovie.title:'Selecciona una película'; renderShowtimes(); updateConfirmButton(); successMessage.classList.add('hidden'); }
  function renderShowtimes(){ showtimesEl.innerHTML=''; if(!selectedMovie) return; selectedMovie.times.forEach(t=>{ const btn=document.createElement('button'); btn.textContent=t; btn.addEventListener('click', ()=>{ Array.from(showtimesEl.children).forEach(c=>c.classList.remove('active')); btn.classList.add('active'); selectedTime=t; updateConfirmButton(); successMessage.classList.add('hidden'); }); showtimesEl.appendChild(btn); }); }
  quantityEl.addEventListener('input', ()=>{ if(!quantityEl.value || Number(quantityEl.value)<1) quantityEl.value=1; updateConfirmButton(); });
  function updateConfirmButton(){ const qty = Number(quantityEl.value)||0; confirmBtn.disabled = !(selectedMovie && selectedTime && qty>=1); }
  confirmBtn.addEventListener('click', ()=>{ const qty = Number(quantityEl.value)||1; if(!selectedMovie||!selectedTime||qty<1) return; confirmationText.textContent = `Has reservado ${qty} entrada(s) para \"${selectedMovie.title}\" a las ${selectedTime}. ¡Disfruta la función!`; successMessage.classList.remove('hidden'); confirmBtn.disabled=true; });

  renderMovies();

});
