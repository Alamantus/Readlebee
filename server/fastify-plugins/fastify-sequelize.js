/* Copied from https://github.com/lyquocnam/fastify-sequelize/blob/master/index.js
 * Copied so custom Sequelize version could be used without needing to wait for non-updated
 * project to update version in NPM.
 * Example Usage:
 * const sequelizeConfig = {
      instance: 'sequelize', // the name of fastify plugin instance. Accessed via fastify.sequelize by default
      autoConnect: true, // auto authentication and test connection on first run
      
      // other sequelize config goes here
      dialect: 'sqlite',

      // SQLite only
      storage: 'path/to/db.sqlite'
  }
 * instance: (optional) the name of instance will be mapped to fastify, default is sequelize
 * autoConnect: default: true auto authentication and test connection on first run.
 * sequelizeConfig: all sequelize configurations, you can see [here](http://docs.sequelizejs.com/manual/installation/getting-started.html#setting-up-a-connection).
 */

const fp = require('fastify-plugin');
const Sequelize = require('sequelize');

function plugin (fastify, options) {
  const { config, registerModels } = options;
  const instance = config.instance || 'sequelize';
  const autoConnect = config.autoConnect || true;

  delete config.instance;
  delete config.autoConnect;

  const sequelize = new Sequelize(config);

  if (autoConnect) {
    return sequelize.authenticate().then(decorate);
  }

  decorate();

  return Promise.resolve()

  function decorate () {
    fastify.decorate(instance, sequelize);
    fastify.decorate('models', registerModels(sequelize));
    fastify.addHook('onClose', (fastifyInstance, done) => {
      sequelize.close()
        .then(done)
        .catch(done);
    });
  }
}

module.exports = fp(plugin);