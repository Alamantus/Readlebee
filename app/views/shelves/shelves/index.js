import html from 'choo/html';
import modal from '../partials/modal';

export const shelvesView = (shelvesController, emit) => {
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
    shelvesController.getUserShelves().then(result => {
      emit('render');
    });
  }
  
  // Should add a scale of publicity: private, friends only, friends & followers, public
  return [
    html`<section>
      <h2>${__('shelves.title')}</h2>
      ${controller.state.myShelves.map(shelf => {
        return html`<article class="card">
          <header>
            <h3>
              <a href="/shelves?shelf=${shelf.id}">${shelf.name}</a>
            </h3>
            ${shelf.isDeletable === true
            ? [
              modal(`editShelf${shelf.id}`, shelvesController, editModal(shelf, shelvesController), {
                buttonHTML: html`<button class="small pseudo pull-right tooltip-left" data-tooltip=${__('interaction.edit')}>
                  <i class="icon-edit"></i>
                </button>`,
                headerText: `${__('shelves.edit.editing')}: ${shelf.name}`,
                footerHTML: html`<footer>
                  <button>
                    ${__('shelves.edit.save')}
                  </button>
                  <label for=${modalId} class="button dangerous">
                    ${__('interaction.close')}
                  </label>
                </footer>`,
              }),

              html`<button class="small pseudo pull-right tooltip-left" data-tooltip=${__('interaction.delete')}>
                <i class="icon-delete"></i>
              </button>`,
            ]
            : null}
          </header>
        </article>`;
      })}
    </section>`,
  ];
}