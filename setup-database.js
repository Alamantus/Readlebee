const path = require('path');
const Sequelize = require('sequelize');
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
      ? path.resolve(siteConfig.sqlite_location)
      : path.resolve(__dirname, './database.sqlite');
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

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  displayName: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },

  // Timestamps
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

const Shelf = sequelize.define('shelf', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isRestricted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'If true, books on this shelf cannot be in other restricted shelves.',
  },
  isPublic: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },

  // Timestamps
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

sequelize.sync();