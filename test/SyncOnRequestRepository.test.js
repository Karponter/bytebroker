'use strict';

const ireq = require('../ireq');
const expect = require('expect');

const SyncOnRequestRepository = ireq.lib('./SyncOnRequestRepository');
const Datasource = ireq.lib('./Datasource');
const InMemoryDatasource = ireq.lib.datasource('./InMemoryDatasource');
const BrokenDatasource = require('./helpers/BrokenDatasource');

const createRepository = options => new SyncOnRequestRepository(options);
const expectToEqual = (expected) => (value) => expect(value).toEqual(expected); 

const wrapAsSetter = (value) => ({ action: 'set', value });
const deleteAction = { action: 'delete' };

describe('SyncOnRequestRepository', () => {
  describe('#constructor', () => {
    it('should initiate storing cache', () => {
      const repository = createRepository();

      expect(repository._syncCache).toBeAn(InMemoryDatasource);
    });
  });

  describe('#set', () => {
    it('should cache data update instead of directly delegate to Datasource', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => repository._syncCache.get('test'))
        .then(expectToEqual(null))
        .then(() => repository.set('test', 'value'))
        .then(() => repository._syncCache.get('test'))
        .then(expectToEqual(wrapAsSetter('value')))
        .then(() => datasource.get('test'))
        .then(expectToEqual(null));
    });

    it('should replace previously cached data', () => {
      const repository = createRepository();

      return Promise.resolve()
        .then(() => repository.set('test', 'value1'))
        .then(() => repository.set('test', 'value2'))
        .then(() => repository._syncCache.get('test'))
        .then(expectToEqual(wrapAsSetter('value2')));
    });
  });

  describe('#get', () => {
    it('should get data from cache with highest proprity', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });
      
      return Promise.resolve()
        .then(() => datasource.set('test', 'wrong-value'))
        .then(() => repository.set('test', 'true-value'))
        .then(() => repository.get('test'))
        .then(expectToEqual('true-value'))
        .then(() => datasource.get('test'))
        .then(expectToEqual('wrong-value'));
    });

    it('should delegate to Datasource if no data provided in cache', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });
      
      return Promise.resolve()
        .then(() => datasource.set('test', 'value'))
        .then(() => repository.get('test'))
        .then(expectToEqual('value'));
    });
  });

  describe('#delete', () => {
    it('should cache data update instead of directly delegate to Datasource', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => datasource.set('test', 'value'))
        .then(() => repository.delete('test'))
        .then(() => repository._syncCache.get('test'))
        .then(expectToEqual(deleteAction))
        .then(() => datasource.get('test'))
        .then(expectToEqual('value'));
    });

    it('should remove previously cached data', () => {
      const repository = createRepository();

      return Promise.resolve()
        .then(() => repository.set('test', 'value'))
        .then(expectToEqual(wrapAsSetter('value')))
        .then(() => repository.delete('test'))
        .then(() => repository._syncCache.get('test'))
        .then(expectToEqual(deleteAction));
    });
  });

  describe('#find', () => {
    it('should consider cache as Datasource with highest priority', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => datasource.set('key1', 'value1'))
        .then(() => datasource.set('key2', 'value1'))
        .then(() => repository.set('key2', 'value2'))
        .then(() => repository.find('test'))
        .then(expectToEqual({ key1: 'value1', key2: 'value2' }));
    });
  });

  describe('#getall', () => {
    it('should consider cache as Datasource with highest priority', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => datasource.set('key1', 'value1'))
        .then(() => datasource.set('key2', 'value1'))
        .then(() => repository.set('key2', 'value2'))
        .then(() => repository.getall())
        .then(expectToEqual({ key1: 'value1', key2: 'value2' }));
    });
  });

  describe('#mget', () => {
    it('should consider cache as Datasource with highest priority', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => datasource.set('key1', 'value1'))
        .then(() => datasource.set('key2', 'value1'))
        .then(() => repository.set('key2', 'value2'))
        .then(() => repository.mget(['key1', 'key2']))
        .then(expectToEqual({ key1: 'value1', key2: 'value2' }));
    });
  });

  describe('#mset', () => {
    it('should delegate to #set method multiple times', () => {
      const repository = createRepository();
      const spy = expect.createSpy(repository, 'set').andCallThrought();

      return Promise.resolve()
        .then(() => repository.mset({ key1: 1, key2: 2, key3: 3 }))
        .then(() => {
          expect(spy).toHaveBeenCalled();
          expect(spy.calls.length).toEqual(3);
        });
    });
  });

  describe('#mdelete', () => {
    it('should delegate to #delete method multiple times', () => {
      const repository = createRepository();
      const spy = expect.createSpy(repository, 'delete').andCallThrought();

      return Promise.resolve()
        .then(() => repository.mdelete({ key1: 1, key2: 2, key3: 3 }))
        .then(() => {
          expect(spy).toHaveBeenCalled();
          expect(spy.calls.length).toEqual(3);
        });
    });
  });

  describe('#sync', () => {
    it('should trigger cached updates applience to Datasources', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => repository.set('key', 'value'))
        .then(() => datasource.get('key'))
        .then(expectToEqual(null))
        .then(() => repository.sync())
        .then(() => datasource.get('key'))
        .then(expectToEqual('value'));
    });

    it('should remove successfully applied operations from cache', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => repository.set('key', 'value'))
        .then(() => repository.sync())
        .then(() => repository._syncCache.get('key'))
        .then(expectToEqual(null));
    });

    it('should keep failed operations in cache', () => {
      const datasource = new BrokenDatasource();
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => repository.set('key', 'value'))
        .then(() => repository.sync())
        .catch(() => {})
        .then(() => repository._syncCache.get('key'))
        .then(expectToEqual(wrapAsSetter('value')));
    });
  });
});

