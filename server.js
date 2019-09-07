'use strict'

require('make-promises-safe'); // installs an 'unhandledRejection' handler

const path = require('path');
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

// Routes
fastify.register(require('./routes/resources'));
fastify.register(require('./routes/home'));
fastify.register(require('./routes/search'));

// Start the server
fastify.listen(3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});