document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.instructions-container img');

  const overlay = document.createElement('div');
  overlay.className = 'image-overlay';
  document.body.appendChild(overlay);

  let activeCard = null;
  let activeImage = null;  

  const hideDetail = () => {
    overlay.classList.remove('show');
    if (activeCard) {
      const card = activeCard;
      const inner = card.querySelector('.inner');
      if (inner) {
        inner.addEventListener('transitionend', () => card.remove(), { once: true });
      } else {
        card.remove();
      }
      card.classList.remove('flipped');
      activeCard = null;
    }
    if (activeImage) {
      activeImage.style.visibility = '';
      activeImage = null;
    }    
  };

  overlay.addEventListener('click', hideDetail);

  images.forEach((img) => {
    img.classList.add('instruction-image');

    if (window.matchMedia('(hover: none)').matches) {
      const stop = () => img.classList.remove('pulsate');
      img.addEventListener('pointerdown', () => img.classList.add('pulsate'));
      img.addEventListener('pointerup', stop);
      img.addEventListener('pointerleave', stop);
      img.addEventListener('pointercancel', stop);
    }

    img.addEventListener('click', () => {
      if (activeCard) hideDetail();

      activeImage = img;
      img.style.visibility = 'hidden';

      const rect = img.getBoundingClientRect();
      const card = document.createElement('div');
      card.className = 'detail-card';
      card.style.width = `${rect.width}px`;
      card.style.height = `${rect.height}px`;
      card.style.left = `${rect.left}px`;
      card.style.top = `${rect.top}px`;

      const inner = document.createElement('div');
      inner.className = 'inner';

      const front = document.createElement('div');
      front.className = 'front';

      const back = document.createElement('div');
      back.className = 'back';
      back.textContent = img.dataset.detail || '';

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);
      document.body.appendChild(card);

      requestAnimationFrame(() => {
        overlay.classList.add('show');
        card.classList.add('flipped');
      });

      activeCard = card;
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideDetail();
  });
});