// script.js - Render cartelera gallery & carousel placeholder (no external dependencies)
// Quick loader hide: make the loader disappear quickly on page entry

document.addEventListener('DOMContentLoaded', ()=>{
  // Quick loader behavior: show very briefly then hide with a fast fade
  const loader = document.getElementById('loader-overlay');
  const loaderLogo = document.getElementById('loader-logo');
  if(loaderLogo){ loaderLogo.onerror = () => { try{ loaderLogo.src = '173 sin título_20260824012952.png'; }catch(e){} }; }

  // Reduce display times for a quick disappearance
  const minDisplay = 120; // ms (very short)
  const maxFallback = 800; // ms (safety)
  const start = performance.now(); let hidden = false;

  function hideImmediate(){
    if(!loader || hidden) return;
    hidden = true;
    loader.classList.add('hidden');
    setTimeout(()=>{ if(loader) loader.style.display = 'none'; }, 240); // allow small fade-out
  }

  function hideAfterMin(){
    if(!loader) return;
    const elapsed = performance.now() - start;
    const wait = Math.max(0, minDisplay - elapsed);
    setTimeout(hideImmediate, wait);
  }

  // Hide quickly on DOMContentLoaded (so users don't wait for full load)
  hideAfterMin();
  // Keep fallback in case something blocks
  const fallback = setTimeout(()=>{ if(loader && !hidden) hideImmediate(); }, maxFallback);

  // --- Gallery rendering & UI (unchanged) ---
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
    { title: 'Canelones', img: 'https://image.tmdb.org/t/p/w500/s2g8wLNs6G5XYa5ivfUNuWbQTKQ.jpg', duration:'1h 30m', rating:'SP', formats:'2D', premiere:true }
  ];

  const grid = document.getElementById('gallery-grid');
  function renderGallery(){
    grid.innerHTML = '';
    posters.forEach(p => {
      const card = document.createElement('article'); card.className = 'card';

      const wrap = document.createElement('div'); wrap.className = 'poster-wrap';
      const img = document.createElement('img'); img.className = 'poster'; img.src = p.img; img.alt = p.title; img.loading = 'lazy';
      wrap.appendChild(img);

      const duration = document.createElement('div'); duration.className = 'duration'; duration.textContent = p.duration; wrap.appendChild(duration);

      const smile = document.createElement('div'); smile.className = 'smile'; smile.textContent = '☺'; wrap.appendChild(smile);

      card.appendChild(wrap);

      const body = document.createElement('div'); body.className = 'card-body';
      const title = document.createElement('h3'); title.className = 'card-title'; title.textContent = p.title;
      const rating = document.createElement('span'); rating.className = 'class-badge'; rating.textContent = p.rating;
      title.appendChild(rating);
      body.appendChild(title);

      const formats = document.createElement('div'); formats.className = 'formats'; formats.textContent = p.formats; body.appendChild(formats);

      card.appendChild(body);

      if(p.premiere){ const tag = document.createElement('div'); tag.className = 'premiere'; tag.textContent = 'Estreno'; card.appendChild(tag); }

      // click opens poster in a new tab
      card.addEventListener('click', ()=> window.open(p.img, '_blank'));

      grid.appendChild(card);
    });
  }

  renderGallery();

  // Floating quick buy button behaviour (scroll to top for now)
  const quick = document.getElementById('quick-buy');
  if(quick) quick.addEventListener('click', ()=> window.scrollTo({ top: 0, behavior: 'smooth' }));

});
