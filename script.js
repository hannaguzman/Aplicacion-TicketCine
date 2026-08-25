/* script.js - Reservation logic + carousel implementation; loader hides immediately */
document.addEventListener('DOMContentLoaded', ()=> {
  // --- Loader handling (immediate hide on load) ---
  const loader = document.getElementById('loader-overlay');
  if(loader){
    window.addEventListener('load', ()=>{
      try{ loader.style.display = 'none'; }catch(e){}
    });
    setTimeout(()=>{ try{ if(loader && loader.style.display !== 'none') loader.style.display = 'none'; }catch(e){} }, 800);
  }
  // --- End loader handling ---

  // --- Carousel data (exact images/titles provided) ---
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

  // Build slides
  function buildCarousel(){
    slides.forEach((s, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const a = document.createElement('a');
      a.href = s.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      const img = document.createElement('img');
      img.className = 'carousel-img';
      img.src = s.img;
      img.alt = s.title;
      a.appendChild(img);
      // caption
      const cap = document.createElement('div'); cap.className = 'carousel-caption'; cap.textContent = s.title;
      slide.appendChild(a);
      slide.appendChild(cap);
      track.appendChild(slide);

      // indicator
      const ind = document.createElement('button');
      ind.addEventListener('click', ()=> goToSlide(i));
      if(i===0) ind.classList.add('active');
      indicators.appendChild(ind);
    });
  }

  function updateTrack(){
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
    // update indicators
    Array.from(indicators.children).forEach((b, idx)=> b.classList.toggle('active', idx===currentIndex));
  }

  function next(){ currentIndex = (currentIndex + 1) % slides.length; updateTrack(); }
  function prev(){ currentIndex = (currentIndex - 1 + slides.length) % slides.length; updateTrack(); }
  function goToSlide(i){ currentIndex = i % slides.length; updateTrack(); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  buildCarousel();
  updateTrack();

  // Optional: keyboard navigation (left/right)
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft') prev();
  });
  // --- End carousel ---

  // --- Reservation app logic ---
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
