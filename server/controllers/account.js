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

  static cleanCreateAccountFormData (formData) {
    return {
      email: formData.email.trim(),
      username: formData.username.toString().trim(),
      displayName: typeof formData.displayName !== 'undefined' ? formData.displayName.toString().trim() : 'A Bee',
      password: formData.password,
    }
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
    return await this.model.create({
      email,
      username,
      displayName,
      passwordHash: hashData.hash,
      passwordSalt: hashData.salt,
      accountConfirm: needsConfirmation ? crypto.randomBytes(32).toString('hex') : null,
    });
  }
}


module.exports = Account;