// Run with `node ./path/to/server/sequelize/generate-db-diagram.js`
(async function(){
  const path = require('path');
  const {writeFileSync} = require('fs');
  const Sequelize = require('sequelize');
  const sequelizeErd = require('sequelize-erd');

  let siteConfig;
  try {
    siteConfig = require('../config.json');
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
            ? path.resolve('../server/', siteConfig.sqlite_location)
            : path.resolve(siteConfig.sqlite_location)
        )
        : path.resolve(__dirname, '../server/database.sqlite');
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
  require('./models')(sequelize);
  
  try {
    const svg = await sequelizeErd({
      source: sequelize,
      engine: 'dot',
      arrowShapes: {
        BelongsToMany: ['crow', 'crow'],
        BelongsTo: ['crow', 'dot'],
        HasMany: ['normal', 'crow'],
        HasOne: ['dot', 'dot'],
      },
      arrowSize: 1,
      lineWidth: 1,
    });
    writeFileSync(path.resolve(__dirname, './db-diagram.svg'), svg);
  } catch (err) { console.error(err) }
  
  // Writes erd.svg to local path with SVG file from your Sequelize models
  })()