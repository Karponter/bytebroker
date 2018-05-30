'use strict';

const testDatasourceIntegrity = require('./datasource-integrity-tester');

const { InMemoryDatasource, JsonDatasource } = require('../lib/datasource');

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
