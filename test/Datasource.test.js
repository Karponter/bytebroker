'use strict';

const testDatasourceIntegrity = require('./datasource-integrity-tester');

const ireq = require('../ireq');
const InMemoryDatasource = ireq.lib.datasource('./InMemoryDatasource');

const vendorProvidedDaasources = [
  {
    class: InMemoryDatasource,
    arguments: null,
  },
];

vendorProvidedDaasources.forEach(info =>
  testDatasourceIntegrity(info.class, info.arguments));
