const sass = require('sass');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('postcss');
const fs = require('fs');

sass.render({ file: 'index.scss' }, function (sassErr, css) {
  if (sassErr) {
    throw sassErr;
  }

  // fs.writeFile('public/css/index.css', css.css, (fileErr) => {
  //   if (fileErr) {
  //     throw fileErr;
  //   }

  //   console.log('The file has been saved!');
  // });
  postcss([autoprefixer,cssnano]).process(css.css, {from:undefined}).then(result => {
    result.warnings().forEach(warn => {
      console.warn(warn.toString());
    });

    if (!fs.existsSync('public')) {
      fs.mkdirSync('public');
    }
    if (!fs.existsSync('public/css')) {
      fs.mkdirSync('public/css');
    }
    fs.writeFile('public/css/index.css', result.css, (fileErr) => {
      if (fileErr) {
        throw fileErr;
      }

      console.log('The file has been saved!');
    });
  }).catch((postcssErr) => {
    throw postcssErr;
  });
});
