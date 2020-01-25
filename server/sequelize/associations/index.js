const path = require('path');
const fs = require('fs');

module.exports = models => {
  const associatedModels = {};
  
  Object.keys(models).forEach(modelName => {
    const associationFileName = path.resolve(__dirname, modelName + '.js');
    if (fs.existsSync(associationFileName)) {
      associatedModels[modelName] = require(associationFileName)(models);
    } else {
      associatedModels[modelName] = models[modelName];
    }
  });

  return associatedModels;
};