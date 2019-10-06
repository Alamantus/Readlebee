import html from 'choo/html';

import { LoginController } from './controller';

export const loginView = (state, emit, i18n) => {
  const controller = new LoginController(state, emit, i18n);
  const { __ } = controller.i18n;

  return html`<section>

    ${
      controller.state.pageMessage === ''
      ? null
      : html`<div class="info card"><header>${controller.state.pageMessage}</header></div>`
    }

    <div class="flex one two-700">
      <div>
        <article class="card">
          <header>
            <h3>${__('login.log_in')}</h3>
          </header>
          <footer>
            <label>
              <span>${__('login.email')}</span>
              <input type="email" name="email"
                value=${controller.state.fieldValues.loginEmail}
                oninput=${e => controller.state.fieldValues.loginEmail = e.target.value.trim()}
              >
            </label>
            <label>
              <span>${__('login.password')}</span>
              <input type="password" name="password"
                value=${controller.state.fieldValues.loginPassword}
                oninput=${e => controller.state.fieldValues.loginPassword = e.target.value}
              >
            </label>
            ${
              controller.state.loginError === ''
              ? null
              : html`<div class="error card">${controller.state.loginError}</div>`
            }
            <button ${controller.state.isChecking ? 'disabled' : null}
              onclick=${() => controller.validateLogin()}
            >
              ${
                controller.state.isChecking
                ? html`<span><i class="icon-loading"></i></span><span>Loading</span>`
                : __('login.login_button')
              }
            </button>
          </footer>
        </article>
      </div>
      <div>
        <article class="card">
          <header>
            <h3>${__('login.create_account')}</h3>
          </header>
          <footer>
            ${
              controller.state.createMessage === ''
              ? null
              : html`<div class="success card"><header>${controller.state.createMessage}</header></div>`
            }
            <label>
              <span>${__('login.email')}</span>
              <input type="email" name="new_email"
                value=${controller.state.fieldValues.createEmail}
                oninput=${e => controller.state.fieldValues.createEmail = e.target.value.trim()}
              >
            </label>
            <label>
              <span>${__('login.password')}</span>
              <input type="password" name="new_password"
                value=${controller.state.fieldValues.createPassword}
                oninput=${e => controller.state.fieldValues.createPassword = e.target.value}
              >
            </label>
            <label>
              <span>${__('login.confirm_password')}</span>
              <input type="password" name="confirm_password"
                value=${controller.state.fieldValues.createConfirm}
                oninput=${e => controller.state.fieldValues.createConfirm = e.target.value}
              >
            </label>
            <label>
              <span>${__('login.username')}</span>
              <input type="text" name="new_username"
                value=${controller.state.fieldValues.createUsername}
                oninput=${e => controller.state.fieldValues.createUsername = e.target.value.trim()}
              >
            </label>
            <label>
              <span>${__('login.display_name')}</span>
              <input type="text" name="new_displayname"
                value=${controller.state.fieldValues.createDisplayName}
                oninput=${e => controller.state.fieldValues.createDisplayName = e.target.value.trim()}
              >
            </label>
            ${
              controller.state.createError === ''
              ? null
              : html`<div class="error card"><header>${controller.state.createError}</header></div>`
            }
            <button class="success"
              ${controller.state.isChecking ? 'disabled' : null}
              onclick=${() => controller.validateCreateAccount()}
            >
              ${
                controller.state.isChecking
                ? html`<span><i class="icon-loading"></i></span><span>Loading</span>`
                : __('login.create_account_button')
              }
            </button>
          </footer>
        </article>
      </div>
    </div>
    
  </section>`;
}