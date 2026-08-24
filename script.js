/* script.js - Lógica para TicketCine (loader handling updated to new splash) */
document.addEventListener('DOMContentLoaded', ()=> {
  // --- Loader handling (splash with logo) ---
  const loader = document.getElementById('loader-overlay');

  function hideLoader(){
    if(!loader) return;
    loader.classList.add('loaded');
    setTimeout(()=>{
      loader.style.display = 'none';
    }, 600);
  }

  // Hide loader on full load, fallback to 3s
  window.addEventListener('load', ()=>{
    hideLoader();
  });
  setTimeout(()=>{
    if(loader && getComputedStyle(loader).display !== 'none') hideLoader();
  }, 3000);
  // --- End loader handling ---

  // Datos de ejemplo: título, sinopsis corta, imagen (placeholder), horarios
  const movies = [
    {
      id:1,
      title:'La Aventura Espacial',
      desc:'Una odisea por el sistema solar llena de emoción y descubrimientos.',
      img:'https://picsum.photos/seed/space/400/240',
      times:['12:00','15:30','18:00','21:00']
    },
    {
      id:2,
      title:'Amor en la Ciudad',
      desc:'Comedia romántica sobre segundas oportunidades.',
      img:'https://picsum.photos/seed/romance/400/240',
      times:['11:00','14:00','17:00','20:30']
    },
    {
      id:3,
      title:'El Misterio del Lago',
      desc:'Thriller psicológico que te mantendrá en tensión hasta el final.',
      img:'https://picsum.photos/seed/mystery/400/240',
      times:['13:00','16:15','19:45']
    }
  ];

  // Estado de la reserva
  let selectedMovie = null;
  let selectedTime = null;

  // Elementos DOM
  const moviesContainer = document.getElementById('movies-container');
  const selectedMovieEl = document.getElementById('selected-movie');
  const showtimesEl = document.getElementById('showtimes');
  const quantityEl = document.getElementById('quantity');
  const confirmBtn = document.getElementById('confirm-btn');
  const successMessage = document.getElementById('success-message');
  const confirmationText = document.getElementById('confirmation-text');

  // Render de tarjetas de películas
  function renderMovies(){
    moviesContainer.innerHTML = '';
    movies.forEach(m => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${m.img}" alt="${escapeHtml(m.title)}">
        <h3>${escapeHtml(m.title)}</h3>
        <p>${escapeHtml(m.desc)}</p>
      `;
      const actions = document.createElement('div');
      actions.className = 'actions';
      const selectBtn = document.createElement('button');
      selectBtn.className = 'btn';
      selectBtn.textContent = 'Seleccionar';
      selectBtn.addEventListener('click', ()=> selectMovie(m.id));
      actions.appendChild(selectBtn);
      card.appendChild(actions);
      moviesContainer.appendChild(card);
    });
  }

  // Seleccionar película
  function selectMovie(id){
    selectedMovie = movies.find(x => x.id === id);
    selectedTime = null;
    selectedMovieEl.textContent = selectedMovie ? selectedMovie.title : 'Selecciona una película';
    renderShowtimes();
    updateConfirmButton();
    successMessage.classList.add('hidden');
  }

  // Render horarios
  function renderShowtimes(){
    showtimesEl.innerHTML = '';
    if(!selectedMovie) return;
    selectedMovie.times.forEach(t => {
      const btn = document.createElement('button');
      btn.textContent = t;
      btn.addEventListener('click', ()=> {
        Array.from(showtimesEl.children).forEach(c=>c.classList.remove('active'));
        btn.classList.add('active');
        selectedTime = t;
        updateConfirmButton();
        successMessage.classList.add('hidden');
      });
      showtimesEl.appendChild(btn);
    });
  }

  // Validar cantidad mínima y actualizar botón confirmar
  quantityEl.addEventListener('input', ()=> {
    if(!quantityEl.value || Number(quantityEl.value) < 1) quantityEl.value = 1;
    updateConfirmButton();
  });

  function updateConfirmButton(){
    const qty = Number(quantityEl.value) || 0;
    confirmBtn.disabled = !(selectedMovie && selectedTime && qty >= 1);
  }

  // Confirmar reserva
  confirmBtn.addEventListener('click', ()=> {
    const qty = Number(quantityEl.value) || 1;
    if(!selectedMovie || !selectedTime || qty < 1) return;
    confirmationText.textContent = `Has reservado ${qty} entrada(s) para \"${selectedMovie.title}\" a las ${selectedTime}. ¡Disfruta la función!`;
    successMessage.classList.remove('hidden');
    confirmBtn.disabled = true;
  });

  // Escape básico para texto mostrado en HTML
  function escapeHtml(str){
    return String(str).replace(/[&<>\"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'
    }[s]));
  }

  // Inicializar
  renderMovies();
});
