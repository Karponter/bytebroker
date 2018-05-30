'use strict';

const trimName = filename => filename.replace(/\.(js|json)$/i, '');

const modules = require("fs")
  .readdirSync(__dirname)
  .map((file) => [trimName(file), require("./" + file)]);

module.exports = modules.reduce((acc, module) => {
  acc[module[0]] = module[1];
  return acc;
}, {});
