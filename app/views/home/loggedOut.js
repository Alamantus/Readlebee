import html from 'choo/html';

export const loggedOutView = (homeController, emit) => {
  const { i18n } = homeController;
  
  return [
    html`<section>
      <h2>${i18n.__('home.logged_out_subtitle')}</h2>
      <article class="flex one three-500">
        <div>
          <div class="card">
            <header class="center-align">
              <span style="font-size:32pt;color:green;">
                <i class="icon-check"></i>
              </span>
            </header>
            <footer>
              ${i18n.__('home.logged_out_track_books')}
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
              ${i18n.__('home.logged_out_share_friends')}
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
              ${i18n.__('home.logged_out_read_rate')}
            </footer>
          </div>
        </div>
      </article>
    </section>`,
    html`<section>
      <h2>${i18n.__('home.logged_out_community_header')}</h2>
      <div class="flex one two-700">
        <div>
          <div class="card">
            <header>
              <h3>${i18n.__('home.logged_out_recent_reviews')}</h3>
              <button class="small pseudo pull-right tooltip-left" data-tooltip=${i18n.__('interaction.reload')}>
                <i class="icon-loading"></i><!--/* This needs to get updated to a reload icon */-->
              </button>
            </header>
            <footer>
              ${homeController.recentReviews.map(review => reviewCard(homeController, review))}
            </footer>
          </div>
        </div>
        <div>
          <div class="card">
            <header>
              <h3>${i18n.__('home.logged_out_recent_updates')}</h3>
              <button class="small pseudo pull-right tooltip-left" data-tooltip=${i18n.__('interaction.reload')}>
                <i class="icon-loading"></i><!--/* This needs to get updated to a reload icon */-->
              </button>
            </header>
            <footer>
              ${homeController.recentUpdates.map(review => reviewCard(homeController, review))}
            </footer>
          </div>
        </div>
      </div>
    </section>`,
    html`<section class="center-align">
      <a href="/login" class="large success button">${i18n.__('home.logged_out_join_now')}</a>
    </section>`,
  ];
}