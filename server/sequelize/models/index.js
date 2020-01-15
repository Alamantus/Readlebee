const path = require('path');

module.exports = sequelize => {
  const modelNames = [  // This is the order required to correctly get references.
    'PermissionLevel',
    'User',
    'BookReference',
    'Shelf',
    'ShelfItem',
    'Status',
    'Review',
    'Recommendation',
    'Reaction',
  ];

  const models = {};
  modelNames.forEach(modelName => {
    const filename = `./${modelName}.js`;
    models[modelName] = require(path.resolve(__dirname, filename))(sequelize);
  });

  return require(path.resolve(__dirname, '../associations'))(models);
};
