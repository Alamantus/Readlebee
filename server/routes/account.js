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

    const result = await account.createUser(formData.email, formData.username, formData.displayName, formData.password);

    if (typeof result.error !== 'undefined') {
      return reply.code(400).send(result);      
    }

    const token = fastify.jwt.sign({ id: result.id });
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