import html from 'choo/html';

export const editModal = (shelf, shelvesController) => {
  const { __ } = shelvesController.i18n;
  
  // Should add a scale of publicity: private, friends only, friends & followers, public
  return [
    html`<article>
      <p>To Do</p>
    </article>`,
  ];
}