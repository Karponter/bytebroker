'use strict';

const ireq = require('ireq');

ireq.init(__dirname);

ireq.bindModule('lib', '/lib');
ireq.lib.bindModule('datasource', '/datasource');
ireq.lib.bindModule('constants', '/constants');

module.exports = ireq;
