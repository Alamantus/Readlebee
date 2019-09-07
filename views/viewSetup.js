const fs = require('fs');
const path = require('path');

const partialFiles = fs.readdirSync(path.resolve(__dirname, 'partials')); // This is resolved from *this file's* dirname
const partials = {
  layout: 'layout.hbs',
};
partialFiles.forEach(file => {
  if (file.includes('.hbs')) {
    const name = file.replace('.hbs', '');
    partials[name] = `partials/${file}`;
  }
});

module.exports = {  // Adds the `view()` function to fastify's `reply` objects
  engine: {
    handlebars: require('handlebars'),  // Use handlebar as the render engine for `reply.view()`
  },
  templates: 'views', // Search for all files referenced in `reply.view()` within the `views/` folder
  options: {
    useHtmlMinifier: require('html-minifier'),  // Add a minifier to the rendered HTML output
    htmlMinifierOptions: {
      removeComments: true,
      removeCommentsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeEmptyAttributes: true
    },
    partials, // Specifies the Handlebars Partials so `point-of-view` knows where they are within the `views` folder and what they're called when referenced in a `.hbs` file
  },
}