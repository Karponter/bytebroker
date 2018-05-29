'use strict';

const ireq = require('../ireq');
const expect = require('expect');

const SyncOnRequestRepository = ireq.lib('./SyncOnRequestRepository');
const Datasource = ireq.lib('./Datasource');
const { InMemoryDatasource } = ireq.lib.datasource('');
const BrokenDatasource = require('./helpers/BrokenDatasource');

const createRepository = options => new SyncOnRequestRepository(options);
const expectToEqual = (expected) => (value) => {
  if (!Array.isArray(expected))
    return expect(value).toEqual(expected);

  expect(value).toBeAn(Array);
  expect(expected.length).toEqual(value.length);
  expected.forEach(unit => expect(value).toInclude(unit));
};

const wrapAsSetter = (value) => ({ action: 'set', value });
const deleteAction = { action: 'delete' };

describe.only('SyncOnRequestRepository', () => {
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
    it('should get data from cache with highest priority', () => {
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

    it('should not show data, marked for removal', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });
      
      return Promise.resolve()
        .then(() => datasource.set('test', 'value'))
        .then(() => repository.delete('test'))
        .then(() => repository.get('test'))
        .then(expectToEqual(null));
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
        .then(() => repository._syncCache.get('test'))
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
        .then(() => repository.find('key'))
        .then(expectToEqual(['key2', 'key1']));
    });

    it('should not show data, marked for removal', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });
      
      return Promise.resolve()
        .then(() => datasource.set('key1', 'value1'))
        .then(() => datasource.set('key2', 'value1'))
        .then(() => repository.delete('key2'))
        .then(() => repository.find('key'))
        .then(expectToEqual(['key1']));
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
        .then(expectToEqual(['key2', 'key1']));
    });

    it('should not show data, marked for removal', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });
      
      return Promise.resolve()
        .then(() => datasource.set('key1', 'value1'))
        .then(() => datasource.set('key2', 'value1'))
        .then(() => repository.delete('key2'))
        .then(() => repository.getall())
        .then(expectToEqual(['key1']));
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
        .then(() => repository._syncCache.get('key2'))
        .then(expectToEqual(wrapAsSetter('value2')))
        .then(() => repository.mget(['key1', 'key2']))
        .then(expectToEqual({ key1: 'value1', key2: 'value2' }));
    });

    it('should not show data, marked for removal', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });
      
      return Promise.resolve()
        .then(() => datasource.set('key1', 'value1'))
        .then(() => datasource.set('key2', 'value1'))
        .then(() => repository.delete('key2'))
        .then(() => repository._syncCache.get('key2'))
        .then(expectToEqual(deleteAction))
        .then(() => repository.mget(['key1', 'key2']))
        .then(expectToEqual({ key1: 'value1', key2: null }));
    });
  });

  describe('#mset', () => {
    it('should delegate to #set method multiple times', () => {
      const repository = createRepository();
      const spy = expect.spyOn(repository, 'set').andCallThrough();

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
      const spy = expect.spyOn(repository, 'delete').andCallThrough();

      return Promise.resolve()
        .then(() => repository.mdelete(['key1', 'key2', 'key3']))
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
        .then(() => datasource.set('key2', 'value2'))
        .then(() => repository.set('key', 'value'))
        .then(() => repository.delete('key2'))
        .then(() => datasource.get('key'))
        .then(expectToEqual(null))
        .then(() => datasource.get('key2'))
        .then(expectToEqual('value2'))
        .then(() => repository.sync())
        .then(() => datasource.get('key'))
        .then(expectToEqual('value'))
        .then(() => datasource.get('key2'))
        .then(expectToEqual(null));
    });

    it('should remove successfully applied set operations from cache', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => repository.set('key', 'value'))
        .then(() => repository.sync())
        .then(() => repository._syncCache.get('key'))
        .then(expectToEqual(null));
    });

    it('should remove successfully applied delete operations from cache', () => {
      const datasource = new InMemoryDatasource({ readPriority: Infinity });
      const repository = createRepository({ datasource: [datasource] });

      return Promise.resolve()
        .then(() => datasource.set('key', 'value'))
        .then(() => repository.delete('key'))
        .then(() => repository._syncCache.get('key'))
        .then(expectToEqual(deleteAction))
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
