// Eventually, I'd like this to be run through Commander so it can confirm things before just overwriting stuff.

const path = require('path');
const fs = require('fs');
const force = typeof process.argv[2] !== 'undefined' && process.argv[2] === 'force';

const Sequelize = require('sequelize');
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
const models = require('./models')(sequelize);

const migration = require('./migration');
const dbVersionPath = path.resolve(__dirname, './.dbversion');
if (!force) {
  if (fs.existsSync(dbVersionPath)) {
    const installedDbVersion = fs.readFileSync(dbVersionPath);
    if (installedDbVersion < migration.dbVersion) {
      console.log(`Migrating from ${installedDbVersion} to ${migration.dbVersion}...`);
      migration.migrateDb(installedDbVersion, sequelize, models);
      return fs.writeFile(dbVersionPath, migration.dbVersion, err => {
        if (err) {
          console.error(err);
        }
        console.log('Migration complete!');
      });
    }
    if (installedDbVersion == migration.dbVersion) {
      return console.log(`No database setup needed: installed version ${installedDbVersion} is the current version.`);
    }
    console.log(`Skipping database migration: installed version ${installedDbVersion} is not less than current version ${migration.dbVersion}.`);
    return console.log('Please check your installation and make sure you have the right server files downloaded.');
  }
}

console.log(`Installing database tables${force ? ', dropping existing ones first' : ''}...`);
sequelize.sync({ force }).then(() => {
  console.log(`Tables installed! Creating Permission Levels...`);
  return models.PermissionLevel.bulkCreate([
    {
      id: 100,
      name: 'db.privacyLevel.private',
      description: 'db.privacyLevel.privateDescription',
    },
    {
      id: 66,
      name: 'db.privacyLevel.friends',
      description: 'db.privacyLevel.friendsDescription',
    },
    {
      id: 33,
      name: 'db.privacyLevel.followers',
      description: 'db.privacyLevel.followersDescription',
    },
    {
      id: 0,
      name: 'db.privacyLevel.public',
      description: 'db.privacyLevel.publicDescription',
    },
  ]).catch((err) => {
    console.error('Could not create Permission Levels:\n', err);
  });
}).then(() => {
  sequelize.close();
  console.log(`Permission Levels created! Writing database version to ${dbVersionPath}...`);
  fs.writeFile(dbVersionPath, migration.dbVersion, err => {
    if (err) {
      console.error(err);
    }
    console.log('Done!');
  });
});
