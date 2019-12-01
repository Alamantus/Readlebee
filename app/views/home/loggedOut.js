import html from 'choo/html';

export const loggedOutView = (homeController, emit) => {
  const { __ } = homeController.i18n;

  return [
    html`<section>
      <h2>${__('home.logged_out.subtitle')}</h2>
      <article class="flex one three-500">
        <div>
          <div class="card">
            <header class="center-align">
              <span style="font-size:32pt;color:green;">
                <i class="icon-check"></i>
              </span>
            </header>
            <footer>
              ${__('home.logged_out.track_books')}
            </footer>
          </div>
        </div>
        <div>
          <div class="card">
            <header class="center-align">
              <span style="font-size:32pt;color:red;">
                <i class="icon-heart-filled"></i>
              </span>
            </header>
            <footer>
              ${__('home.logged_out.share_friends')}
            </footer>
          </div>
        </div>
        <div>
          <div class="card">
            <header class="center-align">
              <span style="font-size:32pt;color:yellow;">
                <i class="icon-star"></i>
              </span>
            </header>
            <footer>
              ${__('home.logged_out.read_rate')}
            </footer>
          </div>
        </div>
      </article>
    </section>`,
    html`<section>
      <h2>${__('home.logged_out.community_header')}</h2>
      <div class="flex one two-700">
        <div>
          <div class="card">
            <header>
              <h3>${__('home.logged_out.recent_reviews')}</h3>
              <button class="small pseudo pull-right tooltip-left" data-tooltip=${__('interaction.reload')}>
                <i class="icon-reload"></i>
              </button>
            </header>
            <footer>
              ${homeController.state.loggedOut.recentReviews.map(review => reviewCard(homeController, review))}
            </footer>
          </div>
        </div>
        <div>
          <div class="card">
            <header>
              <h3>${__('home.logged_out.recent_updates')}</h3>
              <button class="small pseudo pull-right tooltip-left" data-tooltip=${__('interaction.reload')}>
                <i class="icon-reload"></i>
              </button>
            </header>
            <footer>
              ${homeController.state.loggedOut.recentUpdates.map(update => reviewCard(homeController, update))}
            </footer>
          </div>
        </div>
      </div>
    </section>`,
    html`<section class="center-align">
      <a href="/login" class="large success button">${__('home.logged_out.join_now')}</a>
    </section>`,
  ];
}