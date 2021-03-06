const { ViewController } = require('../controller');

class LoginController extends ViewController {
  constructor(state, emit, i18n) {
    // Super passes state, view name, and default state to ViewController,
    // which stores state in this.appState and the view controller's state to this.state
    super(state, i18n, 'login', {
      fieldValues: {
        loginEmail: '',
        loginPassword: '',
        createEmail: '',
        createUsername: '',
        createDisplayName: '',
        createPassword: '',
        createConfirm: '',
        createPermission: 100,
      },
      loginError: '',
      createError: '',
      loginMessage: '',
      createMessage: '',
      pageMessage: '',
      isChecking: false,
    });

    this.emit = emit;

    // If using controller methods in an input's onchange or onclick instance,
    // either bind the class's 'this' instance to the method first...
    // or use `onclick=${() => controller.submit()}` to maintain the 'this' of the class instead.
  }

  clearLoginForm () {
    this.state.fieldValues.loginEmail = '';
    this.state.fieldValues.loginPassword = '';
    
    this.emit(this.appState.events.RENDER);
  }

  clearCreateAccountForm () {
    this.state.fieldValues.createEmail = '';
    this.state.fieldValues.createUsername = '';
    this.state.fieldValues.createDisplayName = '';
    this.state.fieldValues.createPassword = '';
    this.state.fieldValues.createConfirm = '';
    
    this.emit(this.appState.events.RENDER);
  }

  validateLogin () {
    const { __ } = this.i18n;
    this.state.loginError = '';
    this.state.isChecking = true;

    this.emit(this.appState.events.RENDER, () => {
      const {
        loginEmail,
        loginPassword
      } = this.state.fieldValues;

      if ([
        loginEmail,
        loginPassword,
      ].includes('')) {
        this.state.loginError = __('login.login_required_field_blank');
        this.state.isChecking = false;
        this.emit(this.appState.events.RENDER);
        return;
      }

      this.logIn();
    });
  }

  validateCreateAccount () {
    const { __ } = this.i18n;
    this.state.createError = '';
    this.state.isChecking = true;

    this.emit(this.appState.events.RENDER, () => {
      const {
        createEmail,
        createUsername,
        createPassword,
        createConfirm
      } = this.state.fieldValues;

      if ([
        createEmail,
        createUsername,
        createPassword,
        createConfirm,
      ].includes('')) {
        this.state.createError = __('login.create_required_field_blank');
        this.state.isChecking = false;
        this.emit(this.appState.events.RENDER);
        return;
      }

      if (createPassword !== createConfirm) {
        this.state.createError = __('login.create_password_confirm_mismatch');
        this.state.isChecking = false;
        this.emit(this.appState.events.RENDER);
        return;
      }

      this.createAccount();
    });
  }

  logIn () {
    const { __ } = this.i18n;
    const {
      loginEmail,
      loginPassword
    } = this.state.fieldValues;

    fetch('/api/account/login', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
      }),
    }).then(response => response.json())
    .then(response => {
      if (response.error !== false) {
        console.error(response);
        this.state.loginError = __(response.message);
        this.state.isChecking = false;
        this.emit(this.appState.events.RENDER);
        return;
      }

      this.appState.isLoggedIn = true;
      this.state.loginMessage = __(response.message);
      this.state.isChecking = false;
      this.clearLoginForm();
    })
  }

  createAccount () {
    const { __ } = this.i18n;
    const {
      createEmail,
      createUsername,
      createDisplayName,
      createPassword,
      createPermission
    } = this.state.fieldValues;

    fetch('/api/account/create', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: createEmail,
        username: createUsername,
        displayName: createDisplayName,
        password: createPassword,
        permissionLevel: createPermission,
      }),
    }).then(response => response.json())
    .then(response => {
      if (response.error !== false) {
        console.error(response);
        this.state.createError = __(response.message);
        this.state.isChecking = false;
        this.emit(this.appState.events.RENDER);
        return;
      }

      this.state.createMessage = __(response.message);
      this.state.isChecking = false;
      this.clearCreateAccountForm();
    })
  }
}

module.exports = { LoginController };
