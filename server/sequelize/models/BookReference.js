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
    defaultValue: [],
    comment: 'A JSON array with each element being an object with named source <STRING> and source id <STRING>',
  },
  covers: {
    type: Sequelize.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'A JSON array with each element being an object with image url <STRING> and source id <STRING>',
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
  ],
});