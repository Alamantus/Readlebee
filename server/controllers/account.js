const crypto = require('crypto');

class AccountController {
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
      || typeof createAccountData.permissionLevel === 'undefined'
      || createAccountData.password === '') {
      return {
        error: true,
        message: 'api.account.create.required_data_missing',
      };
    }
    if (createAccountData.email.length < 5 || !/^.+@.+\..+$/.test(createAccountData.email)) {
      return {
        error: true,
        message: 'api.account.create.invalid_email',
      };
    }
    if (createAccountData.username.length < 2 || !/^[a-z0-9_]+$/i.test(createAccountData.username)) {
      return {
        error: true,
        message: 'api.account.create.invalid_username',
      };
    }
    if (![100, 33, 0].includes(createAccountData.permissionLevel)) {
      return {
        error: true,
        message: 'api.account.create.invalid_permissionLevel',
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
        message: 'api.account.login.required_data_missing',
      };
    }
    if (loginData.email.length < 5 || !/^.+@.+\..+$/.test(loginData.email)) {
      return {
        error: true,
        message: 'api.account.login.invalid_email',
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
      permissionLevel: formData.permissionLevel,
    }
  }

  static confirmAccountDataIsValid(createAccountData) {
    if (typeof createAccountData.id === 'undefined'
      || typeof createAccountData.confirm === 'undefined'
      || !createAccountData.confirm) {
      return {
        error: true,
        message: 'api.account.confirm.required_data_missing',
      };
    }

    return true;
  }

  async emailExists (email) {
    const existingUser = await this.model.findOne({
      attributes: ['id'],
      where: {
        email,
      },
    });
    return existingUser != null;
  }

  async usernameExists (username) {
    const existingUser = await this.model.findOne({
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
        message: 'api.account.email_exists',
      };
    }
    if (usernameExists) {
      return {
        error: true,
        message: 'api.account.username_exists',
      };
    }

    return true;
  }

  async createUser (email, username, displayName, permissionLevel, password, needsConfirmation) {
    const hashData = AccountController.hashPassword(password);
    // The data should already have gone through AccountController.cleanCreateAccountFormData()
    try {
      return await this.model.create({
        email,
        username,
        displayName,
        permissionLevel,
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
        message: 'api.account.confirm.invalid_code',
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
          message: 'api.account.confirm.update_fail',
        }
      }
      return userToConfirm;
    });
  }

  async validateLogin (email, password) {
    const existingUser = await this.model.findOne({
      attributes: ['id', 'passwordHash', 'passwordSalt', 'accountConfirm'],
      where: {
        email,
      },
    });
    if (existingUser == null) {
      return {
        error: true,
        message: 'api.account.login.invalid_email',
      };
    }

    if (existingUser.accountConfirm !== null) {
      return {
        error: true,
        message: 'api.account.login.not_confirmed',
      };
    }

    const passwordIsValid = AccountController.verifyPassword(existingUser.passwordHash, existingUser.passwordSalt, password);
    if (!passwordIsValid) {
      return {
        error: true,
        message: 'api.account.login.invalid_password',
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


module.exports = AccountController;