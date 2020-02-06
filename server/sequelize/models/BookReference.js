const Sequelize = require('sequelize');

module.exports = sequelize => sequelize.define('BookReference', {
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
    allowNull: false,
    defaultValue: {},
    comment: 'A JSON object with each key a source name and value a source id',
  },
  covers: {
    type: Sequelize.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'A JSON array with each element being an object with image url <STRING> and source id <STRING>',
  },
  locale: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'en',
    comment: 'A basic locale string',
  },
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['name', 'description'],
    },
    {
      fields: ['name'],
    },
    {
      fields: ['description'],
    },
    {
      fields: ['locale'],
    },
  ],
});