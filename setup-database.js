// Eventually, I'd like this to be run through Commander so it can confirm things before just overwriting stuff.

const path = require('path');
const Sequelize = require('sequelize');
const getSequelizeModels = require('./server/getSequelizeModels');
let siteConfig;
try {
  siteConfig = require('./server/config.json');
} catch (ex) {
  console.error('Please copy `config.example.json` to `config.json` and fill it with your server\'s data.');
  process.exit(1);
}

const sequelizeConfig = {
  dialect: siteConfig.db_engine,
};
switch (siteConfig.db_engine) {
  case 'sqlite': {
    sequelizeConfig.storage = typeof siteConfig.sqlite_location !== 'undefined'
      ? (
        siteConfig.sqlite_location.substr(0, 1) === '.' // If relative path, make relative to ./server
          ? path.resolve('./server/', siteConfig.sqlite_location)
          : path.resolve(siteConfig.sqlite_location)
      )
      : path.resolve(__dirname, './server/database.sqlite');
    break;
  }
  default: {
    sequelizeConfig.host = siteConfig.db_host;
    sequelizeConfig.port = siteConfig.db_port;
    sequelizeConfig.database = siteConfig.db_database;
    sequelizeConfig.username = siteConfig.db_username;
    sequelizeConfig.password = siteConfig.db_password;
  }
}

const sequelize = new Sequelize(sequelizeConfig);

const Models = getSequelizeModels(sequelize);

sequelize.sync().then(() => {
  const promises = [ // Default status types to use in Statuses
    { name: 'update' },
    { name: 'progress' },
    { name: 'rating' },
    { name: 'review' },
  ].map(statusType => Models.StatusType.create(statusType).catch(() => console.log(statusType.name, 'already exists')));
  return Promise.all(promises);
}).then(() => {
  sequelize.close();
});