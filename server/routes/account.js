const Sequelize = require('sequelize');
const faker = require('faker');

async function routes(fastify, options) {
  fastify.get('/api/test-db-connect', async (request, reply) => {
    const User = fastify.sequelize.define('user', {
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      test: {
        type: Sequelize.STRING,
        allowNull: true,
      }
    });
    User.sync();
    
    return await User.findAll()
      .catch(async ex => {
        return await User.sync().then(() => {
          return [];
        });
      });

    // return await User.sync().then(() => {
    //   return User.create({
    //     email: faker.internet.email(),
    //   })
    // });
  });

  /*fastify.get('/login', async (request, reply) => {
    reply.view('login.hbs', { text: request.isLoggedInUser ? JSON.stringify(fastify.jwt.decode(request.cookies.token)) : 'you are NOT logged in' });
  });
  
  fastify.post('/login-validate', async (request, reply) => {
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
  
  fastify.get('/logout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' }).redirect('/?loggedout');
  });*/
}

module.exports = routes;