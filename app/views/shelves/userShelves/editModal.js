import html from 'choo/html';

import { modal } from '../../partials/modal';

export const editModal = (shelf, shelvesController) => {
  const { __ } = shelvesController.i18n;

  const modalId = `editShelf${shelf.id}`;
  
  // Should add a scale of publicity: private, friends only, friends & followers, public
  const modalContent = html`<article>
    <p>To Do</p>
  </article>`;

  return modal(modalId, shelvesController, modalContent, {
    buttonHTML: html`<label for=${modalId} class="small pseudo button">
      ${__('interaction.edit')} <i class="icon-edit"></i>
    </label>`,
    headerText: `${__('shelves.edit.editing')}: ${shelf.name}`,
    footerHTML: html`<footer>
      <button>
        ${__('shelves.edit.save')}
      </button>
      <label for=${modalId} class="button dangerous">
        ${__('interaction.close')}
      </label>
    </footer>`,
  });
}