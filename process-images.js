const fs = require('fs');
const sharp = require('sharp');

const folder = './dev/images/';

if (!fs.existsSync('./dev')) {
  fs.mkdirSync('./dev');
}
if (!fs.existsSync('./dev/images')) {
  fs.mkdirSync('./dev/images');
}

const favicon = sharp('./app/images/logo.svg');
const social = sharp('./app/images/social.svg');

social.clone().resize(1280, 640).flatten({ background: '#ffffff' }).toFile(folder + 'social.png', (err, info) => {
  if (err) return console.error(err);
  console.log(info);
});

social.clone().trim(1).resize(null, 48).toFile(folder + 'header.png', (err, info) => {
  if (err) return console.error(err);
  console.log(info);
});

favicon.clone().resize(32, 32).toFile(folder + 'favicon.png', (err, info) => {
  if (err) return console.error(err);
  console.log(info);
});

favicon.clone().resize(128, 128).toFile(folder + 'icon-128.png', (err, info) => {
  if (err) return console.error(err);
  console.log(info);
});

favicon.clone().resize(144, 144).toFile(folder + 'icon-144.png', (err, info) => {
  if (err) return console.error(err);
  console.log(info);
});

favicon.clone().resize(152, 152).toFile(folder + 'icon-152.png', (err, info) => {
  if (err) return console.error(err);
  console.log(info);
});

favicon.clone().resize(192, 192).toFile(folder + 'icon-192.png', (err, info) => {
  if (err) return console.error(err);
  console.log(info);
});

favicon.clone().resize(256, 256).toFile(folder + 'icon-256.png', (err, info) => {
  if (err) return console.error(err);
  console.log(info);
});

favicon.clone().resize(512, 512).toFile(folder + 'icon-512.png', (err, info) => {
  if (err) return console.error(err);
  console.log(info);
});