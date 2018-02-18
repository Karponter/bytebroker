'use strict';

// const ireq = require('../src/ireq');
const expect = require('expect');

const Repository = ireq.lib('./Repository');
const InMemoryDatasource = ireq.lib.datasource('./InMemoryDatasource');
const BrokenDatasource = require('./helpers/BrokenDatasource');

const {
  SYNC_STRATEGY,
  ERROR_PROCESSING_STRATEGY,
} = Repository;

describe('Repository', () => {
  describe('#constructor', () => {
    it('should correctly construct with no parameters', () => {
      const repository = new Repository();

      expect(repository).toBe(Repository);
      expect(repository).toIncludeKeys([
        'datasourceStack',
        'syncStrategy',
        'entityFactory',
        'errorPeocessingStrategy',
        'syncCache',
      ]);

      expect(repository.datasourcesStack).toBeAn('array');
      expect(repository.syncStrategy).toBeA('number');
      expect(repository.errorPeocessingStrategy).toBeA('number');
      expect(repository.datasourcesStack).toBe(null);
    });

    it('should construct with in-memory caching', () => {
      const repository = new Repository();

      expect(repository.syncCache).toBeA(InMemoryDatasource);
    });

    it('should accept custom Datasource stack as provision', () => {
      const repository = new Repository({
        datasource: [ new InMemoryDatasource() ],
      });

      expect(repository.datasourcesStack).toBeA('array');
      expect(repository.datasourcesStack[0]).toBeA(InMemoryDatasource);
    });

    it('should accept custom SyncStrategy as provision', () => {
      const repository = new Repository({
        syncStrategy: SYNC_STRATEGY.SYNC_ON_REQUEST,
      });

      expect(repository.syncStrategy).toEqual(SYNC_STRATEGY.SYNC_ON_REQUEST);
    });

    it('should accept custom EntityFactory as provision', () => {
      const repository = new Repository({
        entityFactory: () => 'testingResult',
      });

      expect(repository.entityFactory).toBeA(Function);
      expect(repository.entityFactory()).toEqual('testingResult');
    });

    it('should accept custom ErrorProcessingStrategy as provision', () => {
      // TBD
    });
  });

  describe('#get', () => {
    
    const testDatasource = new InMemoryDatasource();
    testDatasource.set('id', 'value');

    it('should always return Promise', () => {
      const repository = new Repository({ datasource: [ testDatasource ] });

      const result = repository.get('id');
      epect(result).toBeA(Promise);
    });

    it('should resolve with value stored under specified ID', () => {
      const repository = new Repository({ datasource: [ testDatasource ] });

      return repository.get('id')
        .then(value => expect(value).toEqual('value'));
    });

    it('should resolve with null if no value by id exists', () => {
      const repository = new Repository({ datasource: [ testDatasource ] });

      return repository.get('non-existing-id')
        .then(value => expect(value).toEqual(null));
    });

    it('should reject if error occurs in Datasource', (done) => {
      const brokenDatasource = new BrokenDatasource();
      const repository = new Repository({ datasource: [ brokenDatasource ] });
      const successSpy = expect.createSpy();

      repository.get('id')
        .then(successSpy);
        .catch(() => {
          expect(successSpy).toNotHaveBeenCalled();
          done();
        });
    });

    it('should resolve with value from Datasorce with minimal readPriority property', () => {
      // @todo: move to extednal describe
    });

    it('should try to read all Datasources if requested one fails', () => {
      // @todo: move to extednal describe
    });

    it('should resolve with Entity exemplar if EntityProvider was specified in constructot', () => {
      // @todo: move to extednal describe
    });
  });

  describe('#set', () => {
    const testDatasource = new InMemoryDatasource();
    const readOnlyDatasource = new FileRDatasource(path.join(__dirname, './fixtures/read-only-data.json'));

    it('should always return Promise', () => {
      const repository = new Repository({ datasource: [ testDatasource ] });

      const result = repository.set('id');
      epect(result).toBeA(Promise);
    });

    it('should resolve with ID if value was saved correctly', () => {
      const repository = new Repository({ datasource: [ testDatasource ] });

      return repository.set('id1', 'value1')
        .then(value => expect(value).toEqual('id1'))
        .then(() => testDatasource.get('id1'))
        .then(value => expect(value).toEqual('value1'));
    });

    it('should resolve with null if value was not saved', () => {
      const repository = new Repository({ datasource: [ readOnlyDatasource ] });

      return repository.set('id1', 'value1')
        .then(value => expect(value).toEqual(null));
    });

    it('should set value to WriteFirst datasource with minimal writePriority property', () => {
      // @todo: move to extednal describe
    });

    it('should set value to every WriteAlways datasource', () => {
      // @todo: move to extednal describe
    });

    it('should not set value to any of NoWrite datasource', () => {
      // @todo: move to extednal describe
    });
  });

  describe('#del', () => {
    it('should always return Promise', () => {
      // @todo: do it one time for all methods
    });

    it('should remove value with specified id', () => {
      const repository = new Repository({ datasource: [ testDatasource ] });

      return repository.set('sould-be-removed', 'string')
        .then(() => repository.get('sould-be-removed'))
        .then(value => expect(value).toExist())
        .then(() => repository.del('sould-be-removed'))
        .then(() => repository.get('sould-be-removed'))
        .then(() => expect(value).toEqual(null));
    });

    it('should resolve with true if value was removed', () => {
      const repository = new Repository({ datasource: [ testDatasource ] });
    
      return repository.set('sould-be-removed', 'string')
        .then(() => repository.get('sould-be-removed'))
        .then(value => expect(value).toExist())
        .then(() => repository.del('sould-be-removed'))
        .then(result => expect(result).toEqual(true));
    });

    it('should resolve with false if value was not removed', () => {
      const repository = new Repository({ datasource: [ testDatasource ] });
    
      return repository.get('sould-be-removed')
        .then(value => expect(value).toEqual(null))
        .then(() => repository.del('sould-be-removed'))
        .then(result => expect(result).toEqual(false));
    });

    it('should reject if error occurs while removing', () => {
      // @todo: do it one time for all methods
    });
  });

  describe('#find', () => {
    it('should alwasy return Promise', () => {
      // @todo: do it one time for all methods
    });

    it('should list all records of the datasource if * is specified', () => {
      const datasource = new InMemoryDatasource();
      const repository = new Repository({ datasource: [ datasource ] });

      repository.set()      

    });
  });

  describe('#mset', () => {
    it('should always return Promise', () => {});
    it('should accept list of IDs and list of values as a parameters', () => {});
    it('should resolve a list of IDs that were set', () => {});
    it('should resolve null instead of ID if value was not set', () => {});
    it('should set values to WriteFirst datasource with minimal writePriority property', () => {});
    it('should set values to every WriteAlways datasource', () => {});
    it('should not set values to any of NoWrite datasource', () => {});
  });

  describe('#mget', () => {
    it('should always return Promise', () => {});
    it('should accept list of IDs and list of values as a parameters', () => {});
    it('should resolve multiple entities by specified list of IDs', () => {});
    it('should resolve null for every ID that is not present in datasource', () => {});
    it('should reuse #get method multiple times if #mget is not specified for a datasource', () => {});
    it('should resolve with multiple entities from Datasorce with minimal readPriority property', () => {});
    it('should try to read all Datasources if requested one fails', () => {});
    it('should resolve with Entity exemplar if EntityProvider was specified in constructot', () => {});
  });

  describe('#mdel', () => {
    it('should always return a Promise', () => {});
    it('should accept list of IDs and list of values as a parameters', () => {});
    it('should resolve with reports of every delete operator', () => {});
    it('should resolve with true if value was removed', () => {});
    it('should resolve with false if value was not removed', () => {});
  });

  describe('#sync', () => {
    it('should always return Promise', () => {});
    it('should resolve when sync finished', () => {});
    it('should reject if sync failed', () => {}); 
  });

  describe('SyncStrategy', () => {

    describe('SYNC_ON_TIMEOUT', () => {

      it('should trigger datasource update with specified interval', () => {});

      describe('#sync', () => {

        it('should trigger values update to datasource', () => {});

      });
      describe('#set', () => {

        it('should not trigger datasource update', () => {});

      });
      describe('#delete', () => {

        it('should not trigger datasource update', () => {});

      });
      describe('#mset', () => {

        it('should not trigger datasource update', () => {});

      });
    });

    describe('SYNC_ON_REQUEST', () => {

      describe('#sync', () => {

        it('should trigger values update to datasource', () => {});

      });
      describe('#set', () => {
        
        it('should not trigger datasource update', () => {});

      });
      describe('#delete', () => {
        
        it('should not trigger datasource update', () => {});

      });
      describe('#mset', () => {

        it('should not trigger datasource update', () => {});

      });
    });
    
    describe('SYNC_ON_UPDATE', () => {

      describe('#sync', () => {

        it('should not trigger datasource update', () => {});

      });
      describe('#set', () => {

        it('should trigger values update to datasource', () => {});

      });
      describe('#delete', () => {

        it('should trigger values update to datasource', () => {});

      });
      describe('#mset', () => {

        it('should trigger values update to datasource', () => {});
      });
    });
  });

});
