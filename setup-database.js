// Eventually, I'd like this to be run through Commander so it can confirm things before just overwriting stuff.

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
  isUnique: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'If true, books on this shelf cannot be in other Unique shelves.',
  },
  isPublic: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isDeletable: {
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

const BookReference = sequelize.define('bookReference', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: 'The description is attempted to be made up of the type of work and the author',
  },
  sources: {
    type: Sequelize.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'A JSON array with each element being an object with named source <STRING> and source id <STRING>',
  },
  covers: {
    type: Sequelize.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'A JSON array with each element being an object with image url <STRING> and source id <STRING>',
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

const ShelfItem = sequelize.define('shelfItem', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  shelf: {
    type: Sequelize.INTEGER,
    references: {
      model: Shelf,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  book: {
    type: Sequelize.INTEGER,
    references: {
      model: BookReference,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  order: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
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

const StatusType = sequelize.define('statusType', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const Status = sequelize.define('status', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: Sequelize.INTEGER,
    references: {
      model: StatusType,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  user: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  book: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: BookReference,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  data: {
    type: Sequelize.JSON,
    allowNull: true,
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

const Recommendation = sequelize.define('recommendation', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fromUser: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    },
    comment: 'If null, check data for arbitrary from user text.',
  },
  toUser: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  text: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  book: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: BookReference,
      key: 'id',
      deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
    }
  },
  data: {
    type: Sequelize.JSON,
    allowNull: true,
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

sequelize.sync().then(() => {
  const promises = [ // Default status types to use in Statuses
    { name: 'update' },
    { name: 'progress' },
    { name: 'rating' },
    { name: 'review' },
  ].map(statusType => StatusType.create(statusType).catch(() => console.log(statusType.name, 'already exists')));
  return Promise.all(promises);
}).then(() => {
  sequelize.close();
});