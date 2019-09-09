import html from 'choo/html';

import { I18n } from '../../i18n';

export const loginView = (state, emit) => {
  const i18n = new I18n(state);

  return html`<section>

  <article class="card">
    <div class="container wide">
      <label>
        <span>${i18n.__('login.email')}</span>
        <input type="email" name="email">
      </label>
      <label>
        <span>${i18n.__('login.password')}</span>
        <input type="password" name="password">
      </label>
      <input type="submit" value="${i18n.__('login.login_button')}">
    </div>
  </article>
  
</section>`;
}