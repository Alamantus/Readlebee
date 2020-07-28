/* Copied from https://github.com/lependu/fastify-nodemailer/blob/master/index.js
 * Copied so custom Nodemailer version could be used without needing to wait for non-updated
 * project to update version in NPM.
 * Example Usage:
 * fastify.register(require('fastify-nodemailer'), {
    pool: true,
    host: 'smtp.example.com',
    port: 465,
    secure: true, // use TLS
    auth: {
        user: 'username',
        pass: 'password'
    }
  })
  * Access with fastify.nodemailer.
 */

const fp = require('fastify-plugin');
const Nodemailer = require('nodemailer');

const { createTransport } = Nodemailer;

const fastifyNodemailer = (fastify, options, next) => {
  let transporter = null;

  try {
    transporter = createTransport(options);
  } catch (err) {
    fastify.decorate('canEmail', false);
    return next(err);
  }

  fastify
    .decorate('nodemailer', transporter)
    .decorate('canEmail', true)
    .addHook('onClose', close);

  next();
}

const close = (fastify, done) => {
  fastify.nodemailer.close(done);
}

module.exports = fp(fastifyNodemailer, {
  fastify: '>=2.0.0',
  name: 'fastify-nodemailer'
});