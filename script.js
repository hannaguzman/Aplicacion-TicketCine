// script.js - Renderizado de Cartelera (HTML/CSS/JS puro)
document.addEventListener('DOMContentLoaded', ()=>{
  const movies = [
    { title: 'Tu corazón se romperá', img: 'https://image.tmdb.org/t/p/w500/siSnG1h8JKkuHgM0RuOWLcNxSbz.jpg', duration:'2h 10min', rating:'SP', formats:'3D · D-BOX', premiere:false },
    { title: 'Insidious: Fuera del más allá', img: 'https://image.tmdb.org/t/p/w500/peE3VhpRbIW9VtW2SRaf893JMzJ.jpg', duration:'1h 44min', rating:'R-17', formats:'2D · 4D', premiere:false },
    { title: 'Engendro', img: 'https://image.tmdb.org/t/p/w500/cVQFWGIt5PNw3p7AcQOq2Eg39G.jpg', duration:'1h 52min', rating:'SP', formats:'2D', premiere:false },
    { title: 'La invitación', img: 'https://image.tmdb.org/t/p/w500/21JnfyCARiRkms9AZHtTXiZKbIj.jpg', duration:'2h 02min', rating:'13', formats:'2D · VO', premiere:true },
    { title: 'Adolescencia, sexo y muerte en campamento Miasma', img: 'https://image.tmdb.org/t/p/w500/8UTCpwvHxWPllCJ7YnaCbffmYyD.jpg', duration:'1h 38min', rating:'SP', formats:'2D', premiere:false },
    { title: 'Insaciable', img: 'https://image.tmdb.org/t/p/w500/v9st6lwP4K2i6YCa7kLQVQEuvNZ.jpg', duration:'1h 55min', rating:'G', formats:'3D', premiere:false },
    { title: 'Tiempo de victoria', img: 'https://image.tmdb.org/t/p/w500/byKFPj2xvKkqMKQ4i0Ayq6N7Z9E.jpg', duration:'2h 20min', rating:'SP', formats:'2D · VO', premiere:false },
    { title: 'El árbol muy muy lejano', img: 'https://image.tmdb.org/t/p/w500/udXvLxC5gAqN8SinemyFBEcHpTf.jpg', duration:'1h 50min', rating:'13', formats:'2D', premiere:false },
    { title: 'Tóxico: Un cuento de hadas para adultos', img: 'https://image.tmdb.org/t/p/w500/bhpSB2g6yCKyxRgvgZ27KUgBHg6.jpg', duration:'1h 47min', rating:'R-17', formats:'2D', premiere:false },
    { title: 'Nimrods: A Green Day Comedy', img: 'https://image.tmdb.org/t/p/w500/aebmSpFu1lUV78PtOpqMUn4d82B.jpg', duration:'1h 28min', rating:'G', formats:'2D', premiere:false },
    { title: 'Esa cosa con alas', img: 'https://image.tmdb.org/t/p/w500/aaoS7XEWnKeQCa3EqWAXC803hlg.jpg', duration:'1h 40min', rating:'SP', formats:'2D', premiere:false },
    { title: 'Yo, narciso', img: 'https://image.tmdb.org/t/p/w500/3qe9gaT7jpKVJJ6UtM9Pr5jm3Hq.jpg', duration:'2h 05min', rating:'13', formats:'2D', premiere:false },
    { title: 'Canelones', img: 'https://image.tmdb.org/t/p/w500/s2g8wLNs6G5XYa5ivfUNuWbQTKQ.jpg', duration:'1h 30min', rating:'SP', formats:'2D', premiere:true }
  ];

  const grid = document.getElementById('movies-grid');

  function render(){
    grid.innerHTML = '';
    movies.forEach(m => {
      const card = document.createElement('article');
      card.className = 'movie-card';

      const posterWrap = document.createElement('div'); posterWrap.className = 'poster-wrapper';
      const img = document.createElement('img'); img.className = 'movie-poster'; img.src = m.img; img.alt = m.title;
      posterWrap.appendChild(img);

      const duration = document.createElement('div'); duration.className = 'duration-badge'; duration.textContent = m.duration;
      posterWrap.appendChild(duration);

      const smile = document.createElement('div'); smile.className = 'smile-badge'; smile.textContent = '😊';
      posterWrap.appendChild(smile);

      card.appendChild(posterWrap);

      const body = document.createElement('div'); body.className = 'movie-body';
      const titleRow = document.createElement('div');
      const title = document.createElement('h3'); title.className = 'movie-title'; title.textContent = m.title;
      const rating = document.createElement('span'); rating.className = 'rating-badge'; rating.textContent = m.rating;
      titleRow.appendChild(title); titleRow.appendChild(rating);
      body.appendChild(titleRow);

      const formats = document.createElement('div'); formats.className = 'formats'; formats.textContent = m.formats;
      body.appendChild(formats);

      card.appendChild(body);

      if(m.premiere){
        const tag = document.createElement('div'); tag.className = 'premiere-tag'; tag.textContent = 'Estreno';
        card.appendChild(tag);
      }

      grid.appendChild(card);
    });
  }

  render();

  // Quick-buy floating button behaviour (simple scroll to top demo)
  const quick = document.getElementById('quick-buy');
  quick.addEventListener('click', ()=>{
    window.scrollTo({top:0,behavior:'smooth'});
  });

});
