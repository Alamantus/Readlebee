const html = require('choo/html');

const { ShelvesController } = require('../shelves/controller');

const loggedInView = (homeController, emit) => {
  const { __ } = homeController.i18n;

  const shelvesController = new ShelvesController(homeController.appState, homeController.appState.i18n);

  const { readingShelfId } = homeController.state;
  const readingShelf = readingShelfId && typeof shelvesController.state.loadedShelves[readingShelfId] !== 'undefined'
    ? shelvesController.state.loadedShelves[readingShelfId]
    : null;
  console.log(readingShelf);

  if (shelvesController.appState.isFrontend && shelvesController.state.myShelves.length <= 0) {
    shelvesController.getUserShelves().then(() => {
      const readingShelfId = shelvesController.state.myShelves.find(shelf => shelf.name === 'Reading').id;
      console.log(readingShelfId);
      homeController.state.readingShelfId = readingShelfId + '/';
      console.log(homeController.state);
      return shelvesController.getShelf(homeController.state.readingShelfId);
    }).then(() => {
      emit(shelvesController.appState.events.RENDER);
    });
  }

  return [
    html`<section>
      <h2>${__('home.logged_in.subtitle')}</h2>
      <div class="card">
        <header><h3>Reading</h3></header>
        <footer>
        ${
          readingShelf === null
          ? html`<i class="icon-loading animate-spin"></i>`
          : readingShelf.shelfItems.map((shelfItem, shelfItemIndex) => {
            return html`<div>
                ${ shelfItem.title }
              </div>`;
          })
        }
        </footer>
      </div>
      <div class="flex one two-700">
        <div>
          <div class="card">
            <header>
              <h3>${__('home.logged_in.updates')}</h3>
              <button class="small pseudo pull-right tooltip-left" data-tooltip=${__('interaction.reload')}>
                <i class="icon-reload"></i>
              </button>
            </header>
            <footer>
              ${homeController.state.loggedIn.updates.map(update => reviewCard(homeController, update))}
            </footer>
          </div>
        </div>
        <div>
          <div class="card">
            <header>
              <h3>${__('home.logged_in.interactions')}</h3>
              <button class="small pseudo pull-right tooltip-left" data-tooltip=${__('interaction.reload')}>
                <i class="icon-reload"></i>
              </button>
            </header>
            <footer>
              ${homeController.state.loggedIn.interactions.map(interaction => reviewCard(homeController, interaction))}
            </footer>
          </div>
        </div>
      </div>
    </section>`,
  ];
}

module.exports = { loggedInView };
