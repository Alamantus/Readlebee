'use strict'

require('make-promises-safe'); // installs an 'unhandledRejection' handler

const path = require('path');
let siteConfig;
try {
  siteConfig = require('./config.json.js');
} catch (ex) {
  console.error('Please copy `config.example.json` to `config.json` and fill it with your server\'s data.');
  process.exit(1);
}

const fastify = require('fastify')({
  logger: process.env.NODE_ENV !== 'production',
});
fastify.decorate('siteConfig', siteConfig); // Insert siteConfig into global fastify instance
fastify.register(require('fastify-helmet'));  // Add security stuff
fastify.register(require('fastify-compress'));  // Compress output data for smaller packet delivery
fastify.register(require('fastify-formbody'));  // Enable fastify to parse data sent by POST from forms
fastify.register(require('fastify-static'), { // Enable delivering static content efficiently
  root: path.join(__dirname, 'public'), // all static content will be delivered from the public/ folder
});
fastify.register(require('point-of-view'), require('./views/viewSetup'));  // Adds the `view()` function to fastify's `reply` objects
fastify.register(require('fastify-cookie'));  // Enable reading and setting http-level cookies for the sole purpose of storing login tokens
fastify.register(require('fastify-jwt'), {  // Enable creating, parsing, and verifying JSON Web Tokens from the global fastify object
  secret: fastify.siteConfig.jwtSecretKey,  // The secret key used to generate JWTs. Make it big and random!
});

// Every request, check to see if a valid token exists
fastify.addHook('onRequest', (request, reply, done) => {
  request.isLoggedInUser = typeof request.cookies.token !== 'undefined' && fastify.jwt.verify(request.cookies.token);
  done();
});


// Routes
fastify.register(require('./routes/resources'));
fastify.register(require('./routes/home'));
fastify.register(require('./routes/account'));
fastify.register(require('./routes/search'));

// Start the server
fastify.listen(fastify.siteConfig.port, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});