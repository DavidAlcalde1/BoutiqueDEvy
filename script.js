// ==========================================
// BOTIQUE D'EVY 
// ==========================================


// CARRUSEL 3D
let currentIndex = 0;
const carousel = document.getElementById('carousel');
const togglesContainer = document.getElementById('toggles');
let autoRotateInterval;
let anglePerCard = 0;
let cardsData = [];

// Cargar datos desde JSON
async function loadData() {
  try {
    const response = await fetch('./json/dataCarousel.json');
    const data = await response.json();
    cardsData = data.cards;
    initCarousel();
  } catch (error) {
    console.error('Error cargando el JSON:', error);
  }
}

// Inicializar el carrusel
function initCarousel() {
  const totalCards = cardsData.length;
  
  // Calcular ángulo según cantidad de cards
  anglePerCard = 360 / totalCards;
  
  // Calcular radio óptimo
  const cardWidth = 700;
  const radius = Math.round((cardWidth / 2) / Math.tan((anglePerCard * Math.PI) / 360)) + 50;
  
  // Actualizar CSS variable del radio
  document.documentElement.style.setProperty('--cylinder-radius', `${radius}px`);
  
  // Generar cards HTML
  carousel.innerHTML = cardsData.map((card, index) => `
    <div class="carousel-card" style="transform: rotateY(${index * anglePerCard}deg) translateZ(var(--cylinder-radius));">
      <div class="card-image">
        <img src="${card.image}" alt="${card.title}">
      </div>
      <div class="card-content">
        <h3>${card.title}</h3>
        <p>${card.description}</p>
      </div>
    </div>
  `).join('');
  
  // Generar toggles HTML
  togglesContainer.innerHTML = cardsData.map((_, index) => `
    <button class="toggle-btn ${index === 0 ? 'active' : ''}" onclick="rotateTo(${index})"></button>
  `).join('');
  
  // Iniciar
  rotateTo(0);
  startAutoRotate();
}

function rotateTo(index) {
  const totalCards = cardsData.length;
  currentIndex = ((index % totalCards) + totalCards) % totalCards;
  
  const rotation = -currentIndex * anglePerCard;
  carousel.style.transform = `rotateY(${rotation}deg)`;
  
  const toggles = document.querySelectorAll('.toggle-btn');
  toggles.forEach((btn, i) => {
    btn.classList.toggle('active', i === currentIndex);
  });
}

function nextSlide() {
  rotateTo(currentIndex + 1);
}

function prevSlide() {
  rotateTo(currentIndex - 1);
}

function startAutoRotate() {
  autoRotateInterval = setInterval(nextSlide, 4000);
}

function stopAutoRotate() {
  clearInterval(autoRotateInterval);
}

// Event listeners
document.querySelector('.carousel-container').addEventListener('mouseenter', stopAutoRotate);
document.querySelector('.carousel-container').addEventListener('mouseleave', startAutoRotate);

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    stopAutoRotate();
    nextSlide();
    startAutoRotate();
  } else if (e.key === 'ArrowLeft') {
    stopAutoRotate();
    prevSlide();
    startAutoRotate();
  }
});

// Iniciar todo
loadData();






// ==========================================
// CARRUSEL PLANO + MODAL (LOOP INFINITO)
// ==========================================

const galeryCarousel = document.querySelector('.galeryCarousel');
let galeryData = [];
let currentGalery = 0;
let autoGalery;
let cardsPerView = 5; // visibles por corrida

// Cargar galería desde JSON
async function loadGallery() {
  try {
    const res = await fetch('./json/dataGallery.json');
    const data = await res.json();
    galeryData = data.gallery;

    // Clona hasta tener **mínimo 5 + 2** para loop infinito sin saltos
    const needed = Math.max(galeryData.length, cardsPerView + 2);
    while (galeryData.length < needed) {
      galeryData.push(...galeryData);
    }

    buildInfiniteCarousel();
    startAutoGalery();
  } catch (e) {
    console.error('Error galería:', e);
  }
}

function buildInfiniteCarousel() {
  // Ajusta cuántas verás (máx 5, mín = total)
  cardsPerView = Math.min(5, galeryData.length);
  const cardWidth = 100 / cardsPerView;

  galeryCarousel.innerHTML = `
    <div class="galery-track">
      ${galeryData.map(item => `
        <div class="galery-card" data-src="${item.image}" style="width:${cardWidth}%;">
          <img src="${item.image}" alt="${item.title}">
          <div class="description-content">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
        </div>
      `).join('')}
    </div>
    <button class="close-modal" style="display:none;">&times;</button>
  `;

  // Clicks → modal
  galeryCarousel.querySelectorAll('.galery-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.src));
  });
}

function startAutoGalery() {
  autoGalery = setInterval(() => {
    currentGalery++;
    moveGalery();

    // Cuando llegue a la última imagen real (índice original) salta al principio sin transición visible
    if (currentGalery === galeryData.length - cardsPerView) {
      setTimeout(() => {
        currentGalery = 0;
        const track = galeryCarousel.querySelector('.galery-track');
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        setTimeout(() => track.style.transition = 'transform .5s ease', 50);
      }, 500);
    }
  }, 4000);
}

function moveGalery() {
  const cardWidth = 100 / cardsPerView;
  const track = galeryCarousel.querySelector('.galery-track');
  track.style.transform = `translateX(-${currentGalery * cardWidth}%)`;
}

// Modal ampliado (imagen completa)
function openModal(src) {
  let modal = document.querySelector('.modal-galery');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-galery';
    modal.innerHTML = `
      <div class="modal-content">
        <img src="" alt="Ampliado">
      </div>
      <button class="close-modal">&times;</button>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }
  modal.querySelector('img').src = src;
  modal.style.display = 'flex';
  clearInterval(autoGalery); // pausa mientras está abierto
}

function closeModal() {
  document.querySelector('.modal-galery').style.display = 'none';
  startAutoGalery();
}

// Inicia
loadGallery();















// ==========================================
// FORMULARIO DE CONTACTO 
// ==========================================

// Carga EmailJS
// const script = document.createElement('script');
// script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
// document.head.appendChild(script);

// script.onload = function() {
//     emailjs.init('BPO47zmBDVPb_Or7N');
// };

// const contactoForm = document.getElementById('contactoForm');
// const formStatus = document.getElementById('formStatus');

// contactoForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const btn = contactoForm.querySelector('button');
//     btn.disabled = true;
//     btn.textContent = 'Enviando...';
    
//     Datos del formulario
//     const nombre   = document.getElementById('name').value.trim();
//     const apellido = document.getElementById('lastname').value.trim();
//     const email    = document.getElementById('email').value.trim();
//     const telefono = document.getElementById('phone').value.trim();
    
//     1. Enviar email (EmailJS)
//     try {
//         await emailjs.send('service_o2x4wri', 'template_wddixmm', {
//             name: nombre,
//             lastname: apellido,
//             email: email,
//             phone: telefono
//         });
        
//         2. Abrir WhatsApp con mensaje predeterminado
//         const texto = `Hola, me llamo ${nombre} ${apellido} y deseo consultar acerca de los modelos disponibles.`;
//         const numeroWhatsApp = '946559236'; 
//         const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
        
//         window.open(urlWhatsApp, '_blank');
        
//         showStatus('Mensaje enviado y WhatsApp abierto.', 'success');
//         contactoForm.reset();
        
//     } catch (error) {
//         showStatus('Error al enviar. Intenta nuevamente.', 'error');
//     } finally {
//         btn.disabled = false;
//         btn.textContent = 'Consultar';
//     }
// });

// function showStatus(message, type) {
//     formStatus.textContent = message;
//     formStatus.className = `form-status ${type}`;
//     formStatus.style.display = 'block';
//     setTimeout(() => formStatus.style.display = 'none', 5000);
// }



function validarTelefono(telefono) {
    // Elimina espacios y guiones
    const limpio = telefono.replace(/[\s-]/g, '');
    
    // Validación para Perú: 
    // - 9 dígitos (empieza con 9)
    // - O con código de país: +519XXXXXXXX
    const regexPeru = /^(9\d{8}|\+519\d{8})$/;
    
    return regexPeru.test(limpio);
}




// ==========================================
// FORMULARIO DE CONTACTO (EMAILJS + WHATSAPP + CÓDIGOS DE PRODUCTO)
// ==========================================

// Carga EmailJS
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js  ';
document.head.appendChild(script);

script.onload = function() {
    emailjs.init('BPO47zmBDVPb_Or7N');
};

const contactoForm = document.getElementById('contactoForm');
const formStatus = document.getElementById('formStatus');

contactoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = contactoForm.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Enviando...';
    
    // Datos del formulario
    const nombre   = document.getElementById('name').value.trim();
    const apellido = document.getElementById('lastname').value.trim();
    const email    = document.getElementById('email').value.trim();
    const telefono = document.getElementById('phone').value.trim();
    const code     = document.getElementById('code').value.trim();
    
    // Validación personalizada de teléfono
    if (!validarTelefono(telefono)) {
      showStatus('Por favor, ingresa un número válido (9 dígitos para Perú o con código de país).', 'error');
      btn.disabled = false;
      btn.textContent = 'Consultar';
      return;
    }


    
    // 1. Enviar email (EmailJS)
    try {
        await emailjs.send('service_o2x4wri', 'template_wddixmm', {
            name: nombre,
            lastname: apellido,
            email: email,
            phone: telefono,
            code: code
        });
        
        // 2. Abrir WhatsApp con mensaje predeterminado
        const texto = `Hola, me llamo ${nombre} ${apellido} y deseo consultar acerca de los modelos disponibles.`;
        const numeroWhatsApp = '946559236'; 
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
        
        window.open(urlWhatsApp, '_blank');
        
        showStatus('Mensaje enviado y WhatsApp abierto.', 'success');
        contactoForm.reset();
        
    } catch (error) {
        showStatus('Error al enviar. Intenta nuevamente.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Consultar';
    }
});

function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';
    setTimeout(() => formStatus.style.display = 'none', 5000);
}





