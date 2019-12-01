const crypto = require('crypto');

class Account {
  constructor (userModel) {
    this.model = userModel;
  }

  // hashPassword and validatePassword modified from https://stackoverflow.com/a/17201493
  static hashPassword (password) {
    var salt = crypto.randomBytes(128).toString('base64');
    var iterations = 10000;
    var hash = crypto.pbkdf2Sync(password, salt, iterations, 128, 'sha512').toString('base64');
  
    return {
      salt,
      hash,
      iterations,
    };
  }
  
  static verifyPassword (savedHash, savedSalt, passwordAttempt) {
    const attemptedHash = crypto.pbkdf2Sync(passwordAttempt, savedSalt, 10000, 128, 'sha512').toString('base64');
    return savedHash == attemptedHash;
  }

  static createAccountDataIsValid (createAccountData) {
    if (typeof createAccountData.email === 'undefined'
      || typeof createAccountData.username === 'undefined'
      || typeof createAccountData.password === 'undefined'
      || createAccountData.password === '') {
      return {
        error: true,
        message: 'api.account_create_required_data_missing',
      };
    }
    if (createAccountData.email.length < 5 || !/^.+@.+\..+$/.test(createAccountData.email)) {
      return {
        error: true,
        message: 'api.account_create_invalid_email',
      };
    }
    if (createAccountData.username.length < 2 || !/^[a-z0-9_]+$/i.test(createAccountData.username)) {
      return {
        error: true,
        message: 'api.account_create_invalid_username',
      };
    }

    return true;
  }

  static loginDataIsValid (loginData) {
    if (typeof loginData.email === 'undefined'
      || typeof loginData.password === 'undefined'
      || loginData.password === '') {
      return {
        error: true,
        message: 'api.account_login_required_data_missing',
      };
    }
    if (loginData.email.length < 5 || !/^.+@.+\..+$/.test(loginData.email)) {
      return {
        error: true,
        message: 'api.account_login_invalid_email',
      };
    }

    return true;
  }

  static cleanCreateAccountFormData (formData) {
    var displayName = typeof formData.displayName !== 'undefined' ? formData.displayName.toString().trim() : '';
    return {
      email: formData.email.trim(),
      username: formData.username.toString().trim(),
      displayName: displayName.length > 0 ? displayName : 'A Bee',
      password: formData.password,
    }
  }

  static confirmAccountDataIsValid(createAccountData) {
    if (typeof createAccountData.id === 'undefined'
      || typeof createAccountData.confirm === 'undefined'
      || !createAccountData.confirm) {
      return {
        error: true,
        message: 'api.account_confirm_required_data_missing',
      };
    }

    return true;
  }

  async emailExists (email) {
    const existingUser = await this.model.find({
      attributes: ['id'],
      where: {
        email,
      },
    });
    return existingUser != null;
  }

  async usernameExists (username) {
    const existingUser = await this.model.find({
      attributes: ['id'],
      where: {
        username,
      },
    });
    return existingUser != null;
  }

  async canCreateUser (email, username) {
    const emailExists = await this.emailExists(email);
    const usernameExists = await this.usernameExists(username);
    if (emailExists) {
      return {
        error: true,
        message: 'api.account_email_exists',
      };
    }
    if (usernameExists) {
      return {
        error: true,
        message: 'api.account_username_exists',
      };
    }

    return true;
  }

  async createUser (email, username, displayName, password, needsConfirmation) {
    const hashData = Account.hashPassword(password);
    // The data should already have gone through Account.cleanCreateAccountFormData()
    try {
      return await this.model.create({
        email,
        username,
        displayName,
        passwordHash: hashData.hash,
        passwordSalt: hashData.salt,
        accountConfirm: needsConfirmation ? crypto.randomBytes(32).toString('hex') : null,
      });
    } catch (error) {
      return {
        error,
      };
    }
  }

  async confirmUser (id, accountConfirm) {
    const userToConfirm = await this.model.findOne({
      where: {
        id,
        accountConfirm,
      },
    });

    if (!userToConfirm) {
      return {
        error: true,
        message: 'api.account_confirm_invalid_code',
      }
    }

    return await this.model.update({
      accountConfirm: null,
    }, {
      where: {
        id,
        accountConfirm,
      },
    }).then(success => {
      if (success[0] < 1) {
        return {
          error: true,
          message: 'api.account_confirm_update_fail',
        }
      }
      return userToConfirm;
    });
  }

  async validateLogin (email, password) {
    const existingUser = await this.model.find({
      attributes: ['id', 'passwordHash', 'passwordSalt', 'accountConfirm'],
      where: {
        email,
      },
    });
    if (existingUser == null) {
      return {
        error: true,
        message: 'api.account_login_invalid_email',
      };
    }

    if (existingUser.accountConfirm !== null) {
      return {
        error: true,
        message: 'api.account_login_not_confirmed',
      };
    }

    const passwordIsValid = Account.verifyPassword(existingUser.passwordHash, existingUser.passwordSalt, password);
    if (!passwordIsValid) {
      return {
        error: true,
        message: 'api.account_login_invalid_password',
      };
    }

    return {
      error: false,
      id: existingUser.id,
    };
  }

  async deleteUser(user) {
    return await user.destroy();
  }
}


module.exports = Account;