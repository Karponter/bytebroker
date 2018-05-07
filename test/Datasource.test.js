'use strict';

const testDatasourceIntegrity = require('./datasource-integrity-tester');

const ireq = require('../ireq');
const InMemoryDatasource = ireq.lib.datasource('./InMemoryDatasource');
const JsonDatasource = ireq.lib.datasource('./JsonDatasource');

const vendorProvidedDaasources = [
  {
    class: InMemoryDatasource,
    arguments: null,
  },
  {
    class: JsonDatasource,
    arguments: '/tmp/test.json',
  },
];

vendorProvidedDaasources.forEach(info =>
  testDatasourceIntegrity(info.class, info.arguments));
