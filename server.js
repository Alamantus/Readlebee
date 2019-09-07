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
fastify.register(require('fastify-helmet'));
fastify.register(require('fastify-compress'));
fastify.register(require('fastify-formbody'));
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
});
fastify.register(require('point-of-view'), {
  engine: {
    handlebars: require('handlebars'),
  },
  templates: 'views',
  options: {
    useHtmlMinifier: require('html-minifier'),
    htmlMinifierOptions: {
      removeComments: true,
      removeCommentsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeEmptyAttributes: true
    },
    partials: {
      layout: 'layout.hbs',
      header: 'partials/header.hbs',
      footer: 'partials/footer.hbs',
    }
  },
});

fastify.decorate('siteConfig', siteConfig);

// Routes
fastify.register(require('./routes/resources'));
fastify.register(require('./routes/home'));
fastify.register(require('./routes/search'));

// Start the server
fastify.listen(fastify.siteConfig.port, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});