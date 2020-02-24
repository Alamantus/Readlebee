const fs = require('fs');
const path = require('path');
const AccountController = require('../controllers/account');
const ShelfController = require('../controllers/shelf');

async function routes(fastify, options) {
  fastify.get('/api/accounts/test', async (request, reply) => {
    return false;
  });

  fastify.post('/api/account/create', async (request, reply) => {
    if (request.isLoggedInUser) {
      return reply.code(400).send({
        error: true,
        message: 'api.already_logged_in',
      });
    }

    const formDataIsValid = AccountController.createAccountDataIsValid(request.body);
    if (formDataIsValid !== true) {
      return reply.code(400).send(formDataIsValid);
    }

    const formData = AccountController.cleanCreateAccountFormData(request.body);

    const account = new AccountController(fastify.models.User);

    const canCreateUser = await account.canCreateUser(formData.email, formData.username);
    if (canCreateUser !== true) {
      return reply.code(400).send(canCreateUser);
    }

    const newUser = await account.createUser(formData.email, formData.username, formData.displayName, formData.permissionLevel, formData.password, fastify.canEmail);
    
    if (typeof newUser.error !== 'undefined' && newUser.error !== false) {
      newUser.message = 'api.account.create.fail';
      return reply.code(400).send(newUser);
    }

    const shelf = new ShelfController(fastify.models, null);
    const defaultShelvesCreated = await shelf.createDefaultShelves(newUser);

    // If some of the default shelves are not created successfully, delete the user and send an error
    if (typeof defaultShelvesCreated.error !== 'undefined' && defaultShelvesCreated.error !== false) {
      account.deleteUser(newUser);
      defaultShelvesCreated.message = 'api.account.create.fail';
      return reply.code(400).send(defaultShelvesCreated);
    }

    if (fastify.canEmail) {
      try {
        const file = fs.readFileSync(path.resolve(__dirname, '../templates/email.confirm_account.txt'));
        console.log(file.toString());
        const text = file.toString()
          .replace(/\{display_name\}/g, newUser.displayName)
          .replace(/\{username\}/g, newUser.username)
          .replace(/\{domain\}/g, fastify.siteConfig.domain)
          .replace(/\{id\}/g, newUser.id)
          .replace(/\{code\}/g, newUser.accountConfirm)
          .replace(/\{sender\}/g, fastify.siteConfig.email_from_name);

        return fastify.nodemailer.sendMail({
          // Default to email_username if email_from_address is null/falsy
          from: `"${fastify.siteConfig.email_from_name}" ${!fastify.siteConfig.email_from_address ? fastify.siteConfig.email_username : fastify.siteConfig.email_from_address}`,
          to: `"${newUser.displayName}" ${newUser.email}`,
          subject: 'Please Confirm your Account',
          text,
          // Definitely gonna have to wait to design the HTML version of the email!
          // html: '<p>HTML version of the message</p>',
        }).then(email => {
          if (email.err) {
            console.error(email.err);
            return reply.send({
              error: true,
              message: 'api.account.email_send_fail',
              newUser,
            });
          }

          return reply.send({
            error: false,
            message: 'api.account.confirm.email',
          });
        });
      } catch (ex) {
        console.error(ex);
      }
    }

    return reply.send({
      error: false,
      message: 'api.account.create.success',
    });
  });

  fastify.post('/api/account/confirm', async (request, reply) => {
    if (request.isLoggedInUser) {
      return reply.code(400).send({
        error: true,
        message: 'api.already_logged_in',
      });
    }

    const formDataIsValid = AccountController.confirmAccountDataIsValid(request.body);
    if (formDataIsValid !== true) {
      return reply.code(400).send(formDataIsValid);
    }

    const account = new AccountController(fastify.models.User);

    const confirmed = await account.confirmUser(request.body.id, request.body.confirm);

    if (typeof confirmed.error !== 'undefined') {
      return reply.code(400).send(confirmed);
    }

    // Expects email to be working, and indeed it should be working because that's how the confirmation code was sent.
    try {
      const file = fs.readFileSync(path.resolve(__dirname, '../templates/email.confirm_account_thanks.txt'));
      console.log(file.toString());
      const text = file.toString()
        .replace(/\{display_name\}/g, confirmed.displayName)
        .replace(/\{username\}/g, confirmed.username)
        .replace(/\{domain\}/g, fastify.siteConfig.domain)
        .replace(/\{sender\}/g, fastify.siteConfig.email_from_name);

      return fastify.nodemailer.sendMail({
        // Default to email_username if email_from_address is null/falsy
        from: `"${fastify.siteConfig.email_from_name}" ${!fastify.siteConfig.email_from_address ? fastify.siteConfig.email_username : fastify.siteConfig.email_from_address}`,
        to: `"${confirmed.displayName}" ${confirmed.email}`,
        subject: 'Account Confirmed Successfully',
        text,
        // Definitely gonna have to wait to design the HTML version of the email!
        // html: '<p>HTML version of the message</p>',
      }).then(email => {
        if (email.err) {
          console.error(email.err);
          return reply.code(400).send({
            error: true,
            message: 'api.account.confirm.email_send_fail',
          });
        }

        return reply.send({
          error: false,
          message: 'api.account.confirm.success_email',
        });
      })
    } catch (ex) {
      console.error(ex);
    }

    return reply.send({
      error: false,
      message: 'api.account.confirm.success',
    });
  });

  fastify.post('/api/account/login', async (request, reply) => {
    const formDataIsValid = AccountController.loginDataIsValid(request.body);
    if (formDataIsValid !== true) {
      return reply.code(400).send(formDataIsValid);
    }

    const account = new AccountController(fastify.models.User);
    const user = await account.validateLogin(request.body.email, request.body.password);

    if (user.error === true) {
      return reply.code(400).send(user);
    }

    const token = fastify.jwt.sign({ id: user.id });
    const expireTime = fastify.siteConfig.tokenExpireDays * (24 * 60 * 60e3);  // The section in parentheses is milliseconds in a day

    return reply
      .setCookie('token', token, {
        path: '/',
        expires: new Date(Date.now() + expireTime),
        maxAge: new Date(Date.now() + expireTime),  // Both are set as a "just in case"
        httpOnly: true, // Prevents JavaScript on the front end from grabbing it
        sameSite: true, // Prevents the cookie from being used outside of this site
      })
      .send({
        error: false,
        message: 'api.account.login.success',
      });
  });
  
  fastify.post('/api/account/validate', async (request, reply) => {
    if (typeof request.cookies.token === "undefined") {
      return reply.code(400).send({
        error: true,
        message: 'api.account.validate.missing_token',
      });
    }

    const tokenIsValid = await fastify.jwt.verify(request.cookies.token);
    if (!tokenIsValid) {
      return reply.code(400).send({
        error: true,
        message: 'api.account.validate.invalid_token',
      });
    }

    // Renew the token if valid
    const expireTime = fastify.siteConfig.tokenExpireDays * (24 * 60 * 60e3);  // The section in parentheses is milliseconds in a day
    return reply
      .setCookie('token', request.cookies.token, {
        path: '/',
        expires: new Date(Date.now() + expireTime),
        maxAge: new Date(Date.now() + expireTime),  // Both are set as a "just in case"
        httpOnly: true, // Prevents JavaScript on the front end from grabbing it
        sameSite: true, // Prevents the cookie from being used outside of this site
      })
      .send({
        error: false,
        message: 'api.account.validate.renewed_token',
      });
  });
  
  fastify.get('/logout', async (request, reply) => {
    return reply.clearCookie('token', { path: '/' }).redirect('/');
  });
}

module.exports = routes;