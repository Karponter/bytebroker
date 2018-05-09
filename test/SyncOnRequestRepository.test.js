'use strict';

const ireq = require('../ireq');
const expect = require('expect');

const SyncOnRequestRepository = ireq.lib('./SyncOnRequestRepository');
const Datasource = ireq.lib('./Datasource');
const InMemoryDatasource = ireq.lib.datasource('./InMemoryDatasource');

const createRepository = options => new SyncOnRequestRepository(options);

describe('SyncOnRequestRepository', () => {
  describe('#constructor', () => {
    it('initiate storing cache', () => {
      const repository = createRepository();

      expect(repository.syncCache).toBeAn(InMemoryDatasource);
    });
  });

  describe('#set', () => {
    it('cache data update instead of directly delegate to Datasource', () => {});
    it('replace previously cached data', () => {});
  });

  describe('#get', () => {
    it('get data from cache with highest proprity', () => {});
    it('delegate to Datasource if no data provided in cache', () => {});
  });

  describe('#delete', () => {
    it('cache data update instead of directly delegate to Datasource', () => {});
    it('remove previously cached data', () => {});
  });

  describe('#find', () => {
    it('consider cache as Datasource with highest priority', () => {});
  });

  describe('#getall', () => {
    it('consider cache as Datasource with highest priority', () => {});
  });

  describe('#mget', () => {
    it('consider cache as Datasource with highest priority', () => {});
  });

  describe('#mset', () => {
    it('delegate to #set method multiple times', () => {});
  });

  describe('#mdelete', () => {
    it('delegate to #delete method multiple times', () => {});
  });

  describe('#sync', () => {
    it('trigger cached updates applience to Datasources', () => {});
    it('remove successfully applied operations from cache', () => {});
    it('keep failed operations in cache', () => {});
  });
});

