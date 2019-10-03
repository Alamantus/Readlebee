const fs = require('fs');
const path = require('path');
const Account = require('../controllers/account');

async function routes(fastify, options) {
  fastify.get('/api/accounts/test', async (request, reply) => {
    return false;
  });

  fastify.post('/api/account/create', async (request, reply) => {
    if (request.isLoggedInUser) {
      return reply.code(400).send({
        error: true,
        message: 'api.account_already_logged_in',
      });
    }

    const formDataIsValid = Account.createAccountDataIsValid(request.body);
    if (formDataIsValid !== true) {
      return reply.code(400).send(formDataIsValid);
    }

    const formData = Account.cleanCreateAccountFormData(request.body);

    const account = new Account(fastify.models.User);

    const canCreateUser = await account.canCreateUser(formData.email, formData.username);
    if (canCreateUser !== true) {
      return reply.code(400).send(canCreateUser);
    }

    const newUser = await account.createUser(formData.email, formData.username, formData.displayName, formData.password, fastify.canEmail);

    if (typeof newUser.error !== 'undefined') {
      return reply.code(400).send(newUser);      
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
              message: 'api.account_email_send_fail',
              newUser,
            });
          }

          return reply.send({
            error: false,
            message: 'api.account_confirm_email',
          });
        })
      } catch (ex) {
        console.error(ex);
        return reply.send({
          error: false,
          message: 'api.account_create_success',
        });
      }
    } else {
      const token = fastify.jwt.sign({ id: newUser.id });
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
          message: 'api.account_create_success',
        });
    }
  });

  fastify.post('/api/account/confirm', async (request, reply) => {
    if (request.isLoggedInUser) {
      return reply.code(400).send({
        error: true,
        message: 'api.account_already_logged_in',
      });
    }

    const formDataIsValid = Account.confirmAccountDataIsValid(request.body);
    if (formDataIsValid !== true) {
      return reply.code(400).send(formDataIsValid);
    }

    const account = new Account(fastify.models.User);

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
          return reply.send({
            error: true,
            message: 'api.account_confirm_email_send_fail',
          });
        }

        return reply.send({
          error: false,
          message: 'api.account_confirm_success_email',
        });
      })
    } catch (ex) {
      console.error(ex);
      return reply.send({
        error: false,
        message: 'api.account_confirm_success',
      });
    }
  });

  fastify.get('/api/login', async (request, reply) => {
    reply.view('login.hbs', { text: request.isLoggedInUser ? JSON.stringify(fastify.jwt.decode(request.cookies.token)) : 'you are NOT logged in' });
  });
  
  fastify.post('/api/login-validate', async (request, reply) => {
    if (typeof request.body.email === "undefined" || typeof request.body.password === "undefined") {
      reply.redirect('/login', 400);
    }

    const token = fastify.jwt.sign({ email: request.body.email, password: request.body.password });
    const expireTime = fastify.siteConfig.tokenExpireDays * (24 * 60 * 60e3);  // The section in parentheses is milliseconds in a day
    reply
      .setCookie('token', token, {
        path: '/',
        expires: new Date(Date.now() + expireTime),
        maxAge: new Date(Date.now() + expireTime),  // Both are set as a "just in case"
        httpOnly: true, // Prevents JavaScript on the front end from grabbing it
        sameSite: true, // Prevents the cookie from being used outside of this site
      })
      .redirect('/', 200);
  });
  
  fastify.get('/api/logout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' }).redirect('/?loggedout');
  });
}

module.exports = routes;