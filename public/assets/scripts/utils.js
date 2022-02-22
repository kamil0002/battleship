export const showAlert = (msg, time = 5) => {
  const modal = document.querySelector('.modal');
  modal.querySelector('.modal__description').textContent = msg;
  modal.classList.toggle('modal--hidden');
  window.setTimeout(() => modal.classList.add('modal--hidden'), time * 1000);
  modal
    .querySelector('.modal__close')
    .addEventListener('click', () => modal.classList.add('modal--hidden'));
};
