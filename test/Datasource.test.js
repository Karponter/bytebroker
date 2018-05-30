'use strict';

const testDatasourceIntegrity = require('./datasource-integrity-tester');

const InMemoryDatasource = require('../lib/datasource/InMemoryDatasource');
const JsonDatasource = require('../lib/datasource/JsonDatasource');

const vendorProvidedDaasources = [
  {
    class: InMemoryDatasource,
    arguments: null,
  },
  // {
  //   class: JsonDatasource,
  //   arguments: '/tmp/test.json',
  // },
];

vendorProvidedDaasources.forEach(info =>
  testDatasourceIntegrity(info.class, info.arguments));
