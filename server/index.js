'use strict'

require('make-promises-safe'); // installs an 'unhandledRejection' handler

const path = require('path');
let siteConfig;
try {
  siteConfig = require('./config.json');
} catch (ex) {
  console.error('Please copy `config.example.json` to `config.json` and fill it with your server\'s data.');
  process.exit(1);
}

const fastify = require('fastify')({
  logger: process.env.NODE_ENV !== 'production',
});
fastify.decorate('siteConfig', siteConfig); // Insert siteConfig into global fastify instance
fastify.register(require('fastify-helmet'), {  // Add security stuff
  contentSecurityPolicy: {  // Modify Content Security Policy headers to allow content from specific domains
    directives: {
      'default-src': ["'self'"],  // Default value
      'base-uri': ["'self'"],  // Default value
      'block-all-mixed-content': [],  // Default value
      'frame-ancestors': ["'self'"],  // Default value
      'style-src': ["'self'", "https: 'unsafe-inline'"],  // Default value
      'upgrade-insecure-requests': [],  // Default value
      'object-src': ["'none'"],  // Default value
      'script-src': ["'self'", 'polyfill.io', "https: 'unsafe-inline'"],  // Allow loading scripts inline (required for Choo) and from polyfill.io
      'img-src': ["'self'", siteConfig.inventaireDomain, 'openlibrary.org', 'covers.openlibrary.org', "data:"], // Allow images from Inventaire, Open Library, and raw `data:` hashes
    }
  }
});
fastify.register(require('fastify-compress'));  // Compress output data for smaller packet delivery
fastify.register(require('fastify-static'), { // Enable delivering static content efficiently
  root: path.resolve(__dirname, '../public'), // all static content will be delivered from the public/ folder
});
fastify.register(require('fastify-cookie'));  // Enable reading and setting http-level cookies for the sole purpose of storing login tokens
fastify.register(require('fastify-jwt'), {  // Enable creating, parsing, and verifying JSON Web Tokens from the global fastify object
  secret: fastify.siteConfig.jwtSecretKey,  // The secret key used to generate JWTs. Make it big and random!
});

const sequelizeConfig = {
  instance: 'sequelize',
  autoConnect: true,
  dialect: fastify.siteConfig.db_engine,
};
switch (fastify.siteConfig.db_engine) {
  case 'sqlite': {
    sequelizeConfig.storage = typeof fastify.siteConfig.sqlite_location !== 'undefined'
      ? path.resolve(__dirname, fastify.siteConfig.sqlite_location)
      : path.resolve(__dirname, './database.sqlite');
    break;
  }
  default: {
    sequelizeConfig.host = fastify.siteConfig.db_host;
    sequelizeConfig.port = fastify.siteConfig.db_port;
    sequelizeConfig.database = fastify.siteConfig.db_database;
    sequelizeConfig.username = fastify.siteConfig.db_username;
    sequelizeConfig.password = fastify.siteConfig.db_password;
  }
}
fastify.register(require('./fastify-plugins/fastify-sequelize'), {
  config: sequelizeConfig,
  registerModels: require('./sequelize/models'),
});

if (!fastify.siteConfig.email_host || !fastify.siteConfig.email_username) {
  console.warn('###\nNo email server set up. You will not be able to send emails without entering your email configuration.\n###');
  fastify.decorate('canEmail', false);
} else {
  fastify.register(require('./fastify-plugins/fastify-nodemailer'), {
    pool: true,
    host: fastify.siteConfig.email_host,
    port: fastify.siteConfig.email_port,
    secure: true, // use TLS
    auth: {
      user: fastify.siteConfig.email_username,
      pass: fastify.siteConfig.email_password,
    },
  });
}

// Every request, check to see if a valid token exists
fastify.addHook('onRequest', async (request, reply) => {
  request.isLoggedInUser = false;
  if (typeof request.cookies.token !== 'undefined' && fastify.jwt.verify(request.cookies.token)) {
    const { id } = fastify.jwt.verify(request.cookies.token);
    const user = await fastify.models.User.findByPk(id).catch(ex => fastify.log(ex));
    if (!user) {
      console.log('Invalid user id from token');
      request.clearCookie('token', token, {
        path: '/',
        expires: new Date(Date.now() - 9999),
        maxAge: new Date(Date.now() - 9999),  // Both are set as a "just in case"
        httpOnly: true, // Prevents JavaScript on the front end from grabbing it
        sameSite: true, // Prevents the cookie from being used outside of this site
      });
    } else {
      request.isLoggedInUser = true;
      request.user = user;
    }
  }
  request.language = typeof request.cookies.lang !== 'undefined' ? request.cookies.lang : 'en';

  // Opt out of Google Chrome tracking everything you do.
  // For more info, see: https://plausible.io/blog/google-floc
  reply.header('Permissions-Policy', 'interest-cohort=()');
});

// Store i18n files in fastify object and register locales routes
fastify.register(require('./i18n'));

// Routes
fastify.register(require('./routes/public'));
fastify.register(require('./routes/books'));
fastify.register(require('./routes/account'));
fastify.register(require('./routes/shelf'));
fastify.register(require('./routes/search'));

// Start the server
fastify.listen(fastify.siteConfig.port, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
