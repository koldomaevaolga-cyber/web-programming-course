document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Фильтрация галереи ---------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- Модальная галерея ---------- */
  const modal = document.getElementById('modal');
  const modalImage = document.getElementById('modalImage');
  const thumbButtons = Array.from(document.querySelectorAll('.gallery-thumb'));
  let lastFocused = null;

  function openModal(index) {
    const visible = thumbButtons.filter(b =>
      !b.closest('.gallery-item').classList.contains('is-hidden')
    );
    if (!visible.length) return;
    const img = thumbButtons[index].querySelector('img');
    modalImage.src = img.src;
    modalImage.alt = img.alt;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  }

  function closeModal() {
    modal.hidden = true;
    modalImage.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  function step(direction) {
    const visible = thumbButtons.filter(b =>
      !b.closest('.gallery-item').classList.contains('is-hidden')
    );
    if (!visible.length) return;
    let idx = visible.findIndex(b => b.querySelector('img').src === modalImage.src);
    idx = (idx + direction + visible.length) % visible.length;
    const img = visible[idx].querySelector('img');
    modalImage.src = img.src;
    modalImage.alt = img.alt;
  }

  thumbButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => openModal(i));
  });

  modal.addEventListener('click', e => {
    if (e.target.matches('[data-close]')) closeModal();
    if (e.target.matches('[data-prev]')) step(-1);
    if (e.target.matches('[data-next]')) step(1);
  });

  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- Валидация формы ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  const validators = {
    name: v => v.trim().length >= 2 || 'Введите имя (минимум 2 символа)',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Введите корректный email',
    message: v => v.trim().length >= 10 || 'Сообщение должно быть не короче 10 символов',
  };

  function validateField(input) {
    const rule = validators[input.name];
    if (!rule) return true;
    const result = rule(input.value);
    const field = input.closest('.field');
    const errorEl = field.querySelector('.error');
    if (result === true) {
      field.classList.remove('has-error');
      errorEl.textContent = '';
      return true;
    }
    field.classList.add('has-error');
    errorEl.textContent = result;
    return false;
  }

  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = Array.from(form.querySelectorAll('input, textarea'));
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) {
      status.textContent = 'Пожалуйста, исправьте ошибки в форме.';
      status.className = 'form-status is-error';
      return;
    }
    status.textContent = 'Спасибо! Ваша заявка отправлена — Анна свяжется с вами.';
    status.className = 'form-status is-success';
    form.reset();
  });
});