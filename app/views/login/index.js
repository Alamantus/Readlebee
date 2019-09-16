import html from 'choo/html';

import { LoginController } from './controller';

export const loginView = (state, emit, i18n) => {
  const controller = new LoginController(state, i18n);
  const { __ } = controller.i18n;

  return html`<section>

    <div class="flex one two-700">
      <div>
        <article class="card">
          <header>
            <h3>${__('login.log_in')}</h3>
          </header>
          <footer>
            <label>
              <span>${__('login.email')}</span>
              <input type="email" name="email">
            </label>
            <label>
              <span>${__('login.password')}</span>
              <input type="password" name="password">
            </label>
            <input type="submit" value="${__('login.login_button')}">
          </footer>
        </article>
      </div>
      <div>
        <article class="card">
          <header>
            <h3>${__('login.create_account')}</h3>
          </header>
          <footer>
            <label>
              <span>${__('login.email')}</span>
              <input type="email" name="new_email">
            </label>
            <label>
              <span>${__('login.password')}</span>
              <input type="password" name="new_password">
            </label>
            <label>
              <span>${__('login.confirm_password')}</span>
              <input type="password" name="confirm_password">
            </label>
            <label>
              <span>${__('login.username')}</span>
              <input type="text" name="new_username">
            </label>
            <label>
              <span>${__('login.display_name')}</span>
              <input type="text" name="new_displayname">
            </label>
            <input type="submit" class="success" value="${__('login.create_account_button')}">
          </footer>
        </article>
      </div>
    </div>
    
  </section>`;
}