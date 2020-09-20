const html = require('choo/html');

const loggedInView = (homeController, emit) => {
  const { __ } = homeController.i18n;

  return [
    html`<section>
      <h2>${__('home.logged_in.subtitle')}</h2>
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
