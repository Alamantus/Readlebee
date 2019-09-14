import html from 'choo/html';

import { LoginController } from './controller';

export const loginView = (state, emit) => {
  const controller = new LoginController(state);
  const { i18n } = controller;

  return html`<section>

    <div class="flex one two-700">
      <div>
        <article class="card">
          <header>
            <h3>${i18n.__('login.log_in')}</h3>
          </header>
          <footer>
            <label>
              <span>${i18n.__('login.email')}</span>
              <input type="email" name="email">
            </label>
            <label>
              <span>${i18n.__('login.password')}</span>
              <input type="password" name="password">
            </label>
            <input type="submit" value="${i18n.__('login.login_button')}">
          </footer>
        </article>
      </div>
      <div>
        <article class="card">
          <header>
            <h3>${i18n.__('login.create_account')}</h3>
          </header>
          <footer>
            <label>
              <span>${i18n.__('login.email')}</span>
              <input type="email" name="new_email">
            </label>
            <label>
              <span>${i18n.__('login.password')}</span>
              <input type="password" name="new_password">
            </label>
            <label>
              <span>${i18n.__('login.confirm_password')}</span>
              <input type="password" name="confirm_password">
            </label>
            <label>
              <span>${i18n.__('login.username')}</span>
              <input type="text" name="new_username">
            </label>
            <label>
              <span>${i18n.__('login.display_name')}</span>
              <input type="text" name="new_displayname">
            </label>
            <input type="submit" class="success" value="${i18n.__('login.create_account_button')}">
          </footer>
        </article>
      </div>
    </div>
    
  </section>`;
}