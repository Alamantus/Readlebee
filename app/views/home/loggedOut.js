import html from 'choo/html';

export const loggedOutView = (homeController, emit) => {
  return [
    html`<section>
      <h2>Read Together</h2>
      <article class="flex one three-500">
        <div>
          <div class="card">
            <header class="center-align">
              <span style="font-size:32pt;color:green;">
                <i class="icon-check"></i>
              </span>
            </header>
            <footer>
              Keep track of books you've read, want to read, and are currently reading.
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
              Share your thoughts about what you're reading and see what your friends think of their books.
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
              Read, rate, and recommmend books or something. It'll be cool.
            </footer>
          </div>
        </div>
      </article>
    </section>`,
    html`<section>
      <h2>Join the Community</h2>
      <div class="flex one two-700">
        <div>
          <div class="card">
            <header>
              <h3>Recent Reviews</h3>
              <button class="small pseudo pull-right tooltip-left" data-tooltip="Reload">
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
              <h3>Recent Updates</h3>
              <button class="small pseudo pull-right tooltip-left" data-tooltip="Reload">
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
      <a href="/login" class="large success button">Join Now!</a>
    </section>`,
  ];
}