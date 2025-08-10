document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.instructions-container img');

  images.forEach((img) => {
    img.classList.add('instruction-image');

    if (window.matchMedia('(hover: none)').matches) {
      const stop = () => img.classList.remove('pulsate');
      img.addEventListener('pointerdown', () => img.classList.add('pulsate'));
      img.addEventListener('pointerup', stop);
      img.addEventListener('pointerleave', stop);
      img.addEventListener('pointercancel', stop);
    }
  });
});
