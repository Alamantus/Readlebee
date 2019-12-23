import html from 'choo/html';
import { editModal } from './editModal';

export const userShelvesView = (shelvesController, emit) => {
  const { __ } = shelvesController.i18n;

  if (!shelvesController.isLoggedIn) {
    return [
      html`<section>
        <h2>${__('shelves.no_shelf_selected')}</h2>
        <article class="card">
          <header>
            <p>${__('shelves.not_logged_in')}</p>
          </header>
          <footer>
            <button>${__('global.menu_login')}</button>
          </footer>
        </article>
      </section>`,
    ];
  }

  if (shelvesController.state.myShelves.length <= 0) {
    shelvesController.getUserShelves().then(() => {
      emit('render');
    });
  }
  
  // Should add a scale of publicity: private, friends only, friends & followers, public
  return [
    html`<section>
      <h2>${__('shelves.title')}</h2>
      ${shelvesController.state.myShelves.map(shelf => {
        const deleteButton = html`<button class="small pseudo">
          ${__('interaction.delete')} <i class="icon-delete"></i>
        </button>`;
        
        return html`<article class="card">
          <header>
            <h3>
              <a href="/shelves?shelf=${shelf.id}">${shelf.name}</a>
            </h3>
            ${shelf.isDeletable === true
            ? [
              editModal(shelf, shelvesController),
              [deleteButton], // editModal outputs a modal, which returns an array, so any subsequent html items must also be in an array for Choo to handle it correctly.
            ]
            : null
            }
          </header>
        </article>`;
      })}
    </section>`,
  ];
}