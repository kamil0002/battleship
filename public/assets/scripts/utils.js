export const showModal = () => {
  const modal = document.querySelector('.modal');
  modal.classList.toggle('modal--hidden');
  window.setTimeout(() => modal.classList.add('modal--hidden'), 4000);
  modal
    .querySelector('.modal__close')
    .addEventListener('click', () => modal.classList.add('modal--hidden'));
};
