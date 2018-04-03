'use strict';

const ireq = require('../ireq');
const expect = require('expect');

const Repository = ireq.lib('./Repository');
const Datasource = ireq.lib('./Datasource');
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

      expect(repository).toBeA(Repository);
      expect(repository).toIncludeKeys([
        'datasourceStack',
        'syncStrategy',
        'entityFactory',
        'errorPeocessingStrategy',
        'syncCache',
      ]);

      expect(repository.datasourceStack).toBeAn('array');
      expect(repository.syncStrategy).toBeA('number');
      expect(repository.errorPeocessingStrategy).toBeA('number');
    });

    it('should construct with in-memory caching', () => {
      const repository = new Repository();

      expect(repository.syncCache).toBeA(InMemoryDatasource);
    });

    it('should accept custom Datasource stack as provision', () => {
      const repository = new Repository({
        datasource: [ new InMemoryDatasource() ],
      });

      expect(repository.datasourceStack).toBeA('array');
      expect(repository.datasourceStack[0]).toBeA(InMemoryDatasource);
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

    // @TODO: TBD
    it.skip('should accept custom ErrorProcessingStrategy as provision', () => {});
  });

  describe('methods should be thenable', () => {
    const thenableMethods = ['get', 'set', 'delete', 'mget', 'mset', 'mdelete', 'getall', 'find'];
    const repository = new Repository();

    thenableMethods.forEach((method) => {
      it(`#${method} should return Promise`, () => {
        const defer = repository[method]();
        expect(defer).toBeA(Promise);
        return defer;
      });
    });
  });

  describe('#get', () => {
    let testDatasource = null;

    beforeEach(() => {
      testDatasource = new InMemoryDatasource();
      testDatasource.set('id', 'value');
    });

    it('should delegate to Datasource::get() method', () => {
      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'get').andCallThrough();

      return repository.get('id')
        .then(() => expect(spy).toHaveBeenCalledWith('id'));
    });

    it('should delegate to datasorce with maximum readPriority property', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, { readPriority: 1 });
      const hightPriorityDatasource = new InMemoryDatasource(null, { readPriority: 3 });
      const repository = new Repository({ datasource: [
          defaultDatasource,
          lowPriorityDatasource,
          hightPriorityDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityDatasource, 'get').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'get').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'get').andCallThrough();

      return repository.get('id')
        .then(() => {
          expect(lowPrioritySpy).toNotHaveBeenCalled();
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(hightPrioritySpy).toHaveBeenCalledWith('id');
        });
    });

    it('should try to read other datasources if requested one fails', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, { readPriority: 1 });
      const hightPriorityBrokenDatasource = new BrokenDatasource(null, { readPriority: 3 });
      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityBrokenDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityBrokenDatasource, 'get').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'get').andReturn(Promise.resolve('result-checker'));
      const defaultSpy = expect.spyOn(defaultDatasource, 'get').andCallThrough();

      return repository.get('id')
        .then((data) => {
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(hightPrioritySpy).toHaveBeenCalledWith('id');
          expect(lowPrioritySpy).toHaveBeenCalledWith('id');
          expect(data).toEqual('result-checker');
        });
    });

    it('should resolve with Entity exemplar if EntityFactory was specified in constructot', () => {
      const repository = new Repository({
        datasource: [ testDatasource ],
        entityFactory: real => real + '_modifier',
      });

      return repository.get('id')
        .then(data => expect(data).toEqual('value_modifier'));
    });
  });

  describe('#set', () => {
    const testDatasource = new InMemoryDatasource();

    it('should delegate to Datasource::set() method', () => {
      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'set').andCallThrough();

      return repository.set('id2', 'value2')
        .then(() => expect(spy).toHaveBeenCalledWith('id2', 'value2'));
    });

    it('should delegate to WriteFirst datasource with maximum writePriority property', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 1,
      });
      const hightPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 3,
      });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityDatasource, 'set').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'set').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'set').andCallThrough();

      return repository.set('id2', 'value2')
        .then((data) => {
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(lowPrioritySpy).toNotHaveBeenCalled();
          expect(hightPrioritySpy).toHaveBeenCalledWith('id2', 'value2');
          expect(data).toEqual('id2');
        });
    });

    it('should try to delegate to other datasources if requested one fails', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 1,
      });
      const hightPriorityDatasource = new BrokenDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 3,
      });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityDatasource, 'set').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'set').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'set').andCallThrough();

      return repository.set('id2', 'value2')
        .then((data) => {
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(hightPrioritySpy).toHaveBeenCalledWith('id2', 'value2');
          expect(lowPrioritySpy).toHaveBeenCalledWith('id2', 'value2');
          expect(data).toEqual('id2');
        });
    });

    it('should delegate to every WriteAlways datasource', () => {
      const defaultDatasource = new InMemoryDatasource();
      const writeAlwaysDatasource1 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_ALWAYS,
      });
      const writeAlwaysDatasource2 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_ALWAYS,
      });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        writeAlwaysDatasource1,
        writeAlwaysDatasource2
      ] });

      const spy1 = expect.spyOn(writeAlwaysDatasource1, 'set').andCallThrough();
      const spy2 = expect.spyOn(writeAlwaysDatasource2, 'set').andCallThrough();

      return repository.set('id2', 'value2')
        .then(() => {
          expect(spy1).toHaveBeenCalledWith('id2', 'value2');
          expect(spy2).toHaveBeenCalledWith('id2', 'value2');
        });
    });

    it('should ignore writePriority property for WriteAlways datasource', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 1,
      });
      const hightPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_ALWAYS,
        writePriority: 3,
      });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityDatasource, 'set').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'set').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'set').andCallThrough();

      return repository.set('id2', 'value2')
        .then((data) => {
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(lowPrioritySpy).toHaveBeenCalledWith('id2', 'value2');
          expect(hightPrioritySpy).toHaveBeenCalledWith('id2', 'value2');
          expect(data).toEqual('id2');
        });
    });

    it('should not delegate to any of NoWrite datasource', () => {
      const defaultDatasource = new InMemoryDatasource();
      const noWriteDatasource1 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.NO_WRITE,
      });
      const noWriteDatasource2 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.NO_WRITE,
        writePriority: 100500,
      });

      const repository = new Repository({ datasource: [
        noWriteDatasource1,
        noWriteDatasource2,
        defaultDatasource
      ] });

      const spy1 = expect.spyOn(noWriteDatasource1, 'set').andCallThrough();
      const spy2 = expect.spyOn(noWriteDatasource2, 'set').andCallThrough();
      const spy3 = expect.spyOn(defaultDatasource, 'set').andCallThrough();

      return repository.set('id2', 'value2')
        .then(() => {
          expect(spy1).toNotHaveBeenCalled();
          expect(spy2).toNotHaveBeenCalled();
          expect(spy3).toHaveBeenCalledWith('id2', 'value2');
        });
    });
  });

  describe('#delete', () => {
    it('should delegate to Datasource::delete() method', () => {
      const testDatasource = new InMemoryDatasource();
      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'delete').andCallThrough();

      return repository.delete('id')
        .then(() => expect(spy).toHaveBeenCalledWith('id'));
    });

    it('shoudl delegate to every datasource except NoWrite datasource', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 1,
      });
      const hightPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 2,
      });
      const noWtiteDatasorce = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.NO_WRITE,
      });
      const writeAlwaysDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_ALWAYS,
      });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityDatasource,
        noWtiteDatasorce,
        writeAlwaysDatasource,
      ] });

      const noWriteSpy = expect.spyOn(noWtiteDatasorce, 'delete').andCallThrough();
      const expectebleSpyes = [
        expect.spyOn(defaultDatasource, 'delete').andCallThrough(),
        expect.spyOn(lowPriorityDatasource, 'delete').andCallThrough(),
        expect.spyOn(hightPriorityDatasource, 'delete').andCallThrough(),
        expect.spyOn(writeAlwaysDatasource, 'delete').andCallThrough(),
      ];

      return repository.delete('id')
        .then((resolution) => {
          expect(noWriteSpy).toNotHaveBeenCalled();
          expectebleSpyes.forEach(spy => expect(spy).toHaveBeenCalledWith('id'));
        });
    });
  });

  describe('#getall', () => {
    it('should delegate to Datasource::getall() method', () => {
      const testDatasource = new InMemoryDatasource();
      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'getall').andCallThrough();

      return repository.getall()
        .then(() => expect(spy).toHaveBeenCalled());
    });

    it('should merge all data from datasources with respect to readPriority', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, { readPriority: 1 });
      const hightPriorityDatasource = new InMemoryDatasource(null, { readPriority: 3 });

      defaultDatasource.set('default', true);
      defaultDatasource.set('hight', false);

      lowPriorityDatasource.set('hight', false);
      lowPriorityDatasource.set('low', true);

      hightPriorityDatasource.set('hight', true);

      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityDatasource
      ] });

      return repository.getall()
        .then(data => expect(data).toEqual([ 'hight', 'low', 'default' ]));
    });
  });

  describe('#find', () => {
    it('should delegate to Datasource::find() method', () => {
      const testDatasource = new InMemoryDatasource();
      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'find').andCallThrough();

      return repository.find(/.*/)
        .then(() => expect(spy).toHaveBeenCalledWith(/.*/));
    });

    it('should resolve empty array if Datasource::find() is not implemented', () => {
      const testDatasource = new InMemoryDatasource();
      testDatasource.find = undefined;

      const repository = new Repository({ datasource: [testDatasource] });

      return repository.find(/.*/)
        .then((keysList) => {
          expect(keysList).toBeAn(Array);
          expect(keysList.length).toEqual(0);
        });
    });
  });

  describe('#mset', () => {
    const msetFixture = {
      id1: 'value1',
      id2: 'value2',
    };

    it('should delegate to Datasource::mset() method', () => {
      const testDatasource = new InMemoryDatasource();
      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'mset').andCallThrough();

      return repository.mset({ id2: 2, id3: 3 })
        .then(() => expect(spy).toHaveBeenCalledWith({ id2: 2, id3: 3 }));
    });

    it('should delegate to WriteFirst datasource with maximum writePriority property', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 1,
      });
      const hightPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 3,
      });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityDatasource, 'mset').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'mset').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'mset').andCallThrough();

      return repository.mset(msetFixture)
        .then((data) => {
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(lowPrioritySpy).toNotHaveBeenCalled();
          expect(hightPrioritySpy).toHaveBeenCalledWith(msetFixture);
          expect(data).toInclude(...Object.keys(msetFixture));
        });
    });

    it('should try to delegate to other datasources if requested one fails', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 1,
      });
      const hightPriorityDatasource = new BrokenDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 3,
      });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityDatasource, 'mset').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'mset').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'mset').andCallThrough();

      return repository.mset(msetFixture)
        .then((data) => {
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(hightPrioritySpy).toHaveBeenCalledWith(msetFixture);
          expect(lowPrioritySpy).toHaveBeenCalledWith(msetFixture);
          expect(data).toInclude(...Object.keys(msetFixture));
        });
    });

    it('should delegate to every WriteAlways datasource', () => {
      const defaultDatasource = new InMemoryDatasource();
      const writeAlwaysDatasource1 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_ALWAYS,
      });
      const writeAlwaysDatasource2 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_ALWAYS,
      });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        writeAlwaysDatasource1,
        writeAlwaysDatasource2
      ] });

      const spy1 = expect.spyOn(writeAlwaysDatasource1, 'mset').andCallThrough();
      const spy2 = expect.spyOn(writeAlwaysDatasource2, 'mset').andCallThrough();

      return repository.mset(msetFixture)
        .then(() => {
          expect(spy1).toHaveBeenCalledWith(msetFixture);
          expect(spy2).toHaveBeenCalledWith(msetFixture);
        });
    });

    it('should ignore writePriority property for WriteAlways datasource', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_FIRST,
        writePriority: 1,
      });
      const hightPriorityDatasource = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.WRITE_ALWAYS,
        writePriority: 3,
      });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityDatasource, 'mset').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'mset').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'mset').andCallThrough();

      return repository.mset(msetFixture)
        .then((data) => {
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(lowPrioritySpy).toHaveBeenCalledWith(msetFixture);
          expect(hightPrioritySpy).toHaveBeenCalledWith(msetFixture);
          expect(data).toInclude(...Object.keys(msetFixture));
        });
    });

    it('should not delegate to any of NoWrite datasource', () => {
      const defaultDatasource = new InMemoryDatasource();
      const noWriteDatasource1 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.NO_WRITE,
      });
      const noWriteDatasource2 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.NO_WRITE,
        writePriority: 100500,
      });

      const repository = new Repository({ datasource: [
        noWriteDatasource1,
        noWriteDatasource2,
        defaultDatasource
      ] });

      const spy1 = expect.spyOn(noWriteDatasource1, 'mset').andCallThrough();
      const spy2 = expect.spyOn(noWriteDatasource2, 'mset').andCallThrough();
      const spy3 = expect.spyOn(defaultDatasource, 'mset').andCallThrough();

      return repository.mset(msetFixture)
        .then(() => {
          expect(spy1).toNotHaveBeenCalled();
          expect(spy2).toNotHaveBeenCalled();
          expect(spy3).toHaveBeenCalledWith(msetFixture);
        });
    });

    it('should delegate to multiple #set() methods if #mset is not implemented', () => {
      const testDatasource = new InMemoryDatasource();
      testDatasource.mset = undefined;

      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'set').andCallThrough();

      return repository.mset({ id1: 1, id2: 2, id3: 3 })
        .then(() => {
          expect(spy.calls.length).toEqual(3);
          spy.calls.forEach((call, index) => {
            const num = index + 1;
            expect(call.arguments).toEqual([ `id${num}`, num ]);
          });
        });
    });
  });

  describe('#mget', () => {
    it('should delegate to Datasource::mget() method', () => {
      const testDatasource = new InMemoryDatasource();
      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'mget').andCallThrough();

      return repository.mget(['id2', 'id3'])
        .then(() => expect(spy).toHaveBeenCalledWith(['id2', 'id3']));
    });

    it('should delegate to datasorce with maximum readPriority property', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, { readPriority: 1 });
      const hightPriorityDatasource = new InMemoryDatasource(null, { readPriority: 3 });
      hightPriorityDatasource.mset({ id1: 'value1', id2: 'value2' });

      const repository = new Repository({ datasource: [
          defaultDatasource,
          lowPriorityDatasource,
          hightPriorityDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityDatasource, 'mget').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'mget').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'mget').andCallThrough();

      return repository.mget(['id1', 'id2'])
        .then(() => {
          expect(lowPrioritySpy).toNotHaveBeenCalled();
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(hightPrioritySpy).toHaveBeenCalledWith(['id1', 'id2']);
        });
    });

    it('should try to read other datasources if requested one fails', () => {
      const defaultDatasource = new InMemoryDatasource();
      const lowPriorityDatasource = new InMemoryDatasource(null, { readPriority: 1 });
      const hightPriorityBrokenDatasource = new BrokenDatasource(null, { readPriority: 3 });
      lowPriorityDatasource.mset({ id1: 'value1', id2: 'value2' });
      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityBrokenDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityBrokenDatasource, 'mget').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'mget').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'mget').andCallThrough();

      return repository.mget(['id1', 'id2'])
        .then((data) => {
          expect(defaultSpy).toNotHaveBeenCalled();
          expect(hightPrioritySpy).toHaveBeenCalledWith(['id1', 'id2']);
          expect(lowPrioritySpy).toHaveBeenCalledWith(['id1', 'id2']);
          expect(data).toEqual({ id1: 'value1', id2: 'value2' });
        });
    });

    it('should try to read other datasources if requested contains not fluent data', () => {
      const defaultDatasource = new InMemoryDatasource();
      defaultDatasource.mset({ id1: 'wrong-value1', id3: 'value3' });
      const lowPriorityDatasource = new InMemoryDatasource(null, { readPriority: 1 });
      lowPriorityDatasource.mset({ id1: 'value1', id2: 'value2' });
      const hightPriorityBrokenDatasource = new BrokenDatasource(null, { readPriority: 3 });

      const repository = new Repository({ datasource: [
        defaultDatasource,
        lowPriorityDatasource,
        hightPriorityBrokenDatasource
      ] });

      const hightPrioritySpy = expect.spyOn(hightPriorityBrokenDatasource, 'mget').andCallThrough();
      const lowPrioritySpy = expect.spyOn(lowPriorityDatasource, 'mget').andCallThrough();
      const defaultSpy = expect.spyOn(defaultDatasource, 'mget').andCallThrough();

      return repository.mget(['id1', 'id2', 'id3', 'id4'])
        .then((data) => {
          expect(hightPrioritySpy).toHaveBeenCalledWith(['id1', 'id2', 'id3', 'id4']);
          expect(lowPrioritySpy).toHaveBeenCalledWith(['id1', 'id2', 'id3', 'id4']);
          expect(defaultSpy).toHaveBeenCalledWith(['id3', 'id4']);
          expect(data).toEqual({
            id1: 'value1',
            id2: 'value2',
            id3: 'value3',
            id4: null,
          });
        })
    });

    it('should resolve with Entity exemplar if EntityFactory was specified in constructot', () => {
      const datasource = new InMemoryDatasource();
      datasource.set('id1', 'value1');
      datasource.set('id2', 'value2');

      const repository = new Repository({
        datasource: [ datasource ],
        entityFactory: real => real + '_modifier',
      });

      return repository.mget(['id1', 'id2'])
        .then(data => expect(data).toEqual({
          id1: 'value1_modifier',
          id2: 'value2_modifier',
        }));
    });

    it('should delegate to multiple #get() methods if #mget is not implemented', () => {
      const testDatasource = new InMemoryDatasource();
      testDatasource.mget = undefined;

      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'get').andCallThrough();

      return repository.mget(['id1', 'id2', 'id3'])
        .then(() => {
          expect(spy.calls.length).toEqual(3);
          spy.calls.forEach((call, index) => {
            expect(call.arguments).toEqual([ `id${index + 1}` ]);
          });
        });
    });
  });

  describe('#mdelete', () => {
    it('should delegate to Datasource::mdelete() method', () => {
      const testDatasource = new InMemoryDatasource();
      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'mdelete').andCallThrough();

      return repository.mdelete(['id2', 'id3'])
        .then(() => expect(spy).toHaveBeenCalledWith(['id2', 'id3']));
    });

    it('should not delegate to any of NoWrite datasource', () => {
      const defaultDatasource = new InMemoryDatasource();
      const noWriteDatasource1 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.NO_WRITE,
      });
      const noWriteDatasource2 = new InMemoryDatasource(null, {
        writeMode: Datasource.WRITE_MODE.NO_WRITE,
        writePriority: 100500,
      });

      const repository = new Repository({ datasource: [
        noWriteDatasource1,
        noWriteDatasource2,
        defaultDatasource
      ] });

      const spy1 = expect.spyOn(noWriteDatasource1, 'mdelete').andCallThrough();
      const spy2 = expect.spyOn(noWriteDatasource2, 'mdelete').andCallThrough();
      const spy3 = expect.spyOn(defaultDatasource, 'mdelete').andCallThrough();

      return repository.mdelete(['key1', 'key2'])
        .then(() => {
          expect(spy1).toNotHaveBeenCalled();
          expect(spy2).toNotHaveBeenCalled();
          expect(spy3).toHaveBeenCalledWith(['key1', 'key2']);
        });
    });

    it('should collect truthly reports from all accessed Datasources', () => {
      const emptyDatasource = new InMemoryDatasource();
      const fooDatasource = new InMemoryDatasource();
      fooDatasource.set('foo', 'bar');
      const barDatasource = new InMemoryDatasource();
      barDatasource.set('bar', 'yes');
      barDatasource.set('baz', 'yes');

      const fooSpy = expect.spyOn(fooDatasource, 'mdelete').andCallThrough();
      const barSpy = expect.spyOn(barDatasource, 'mdelete').andCallThrough();

      const repository = new Repository({ datasource: [
        emptyDatasource,
        fooDatasource,
        barDatasource,
      ] });

      return repository.mdelete(['foo', 'bar', 'weird'])
        .then((report) => {
          expect(report).toIncludeKeys(['foo', 'bar', 'weird']);
          expect(report.foo).toEqual(true);
          expect(report.bar).toEqual(true);
          expect(report.weird).toEqual(false);
        });
    });

    it('should delegate to multiple #delete() methods if #mdelete is not implemented', () => {
      const testDatasource = new InMemoryDatasource();
      testDatasource.mdelete = undefined;

      const repository = new Repository({ datasource: [testDatasource] });
      const spy = expect.spyOn(testDatasource, 'delete').andCallThrough();

      return repository.mdelete(['id1', 'id2', 'id3'])
        .then(() => {
          expect(spy.calls.length).toEqual(3);
          spy.calls.forEach((call, index) => {
            expect(call.arguments).toEqual([ `id${index + 1}` ]);
          });
        });
    });
  });

  describe.skip('#sync', () => {
    it('it should resolve when sync process is finished', () => {
      const context = {};
      const dskeys = ['one', 'two', 'four'];

      const datasources = dskeys.map((dsid) => {
        const ds = new InMemoryDatasource();
        ds.mset = undefined;
        ds.set = () => new Promise((resolve) => {
          context[key] = true;
          resolve(true);
        });
      });

      const repository = new Repository({ datasource: datasources });

      repository.sync()
        .then((report) => {
          expect(context.toIncludeKeys(dskeys));
          expect(Object.keys(context).length).toEqual(dskeys.length);
          dskeys.forEach(key => expect(context[key]).toEqual(true));
        });
    });
  });

  describe.skip('SyncStrategy', () => {

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
