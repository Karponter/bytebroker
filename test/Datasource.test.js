'use strict';
const expect = require('expect');
const fs = require('fs');
// const FileReadWriteDataSource = require('../src/lib/datasource/FileReadWriteDataSource');
const inMemoryDataSource = require('../src/lib/datasource/InMemoryDatasource');
let dataSource, brokenDataSource, nonExistantDataSource, emptyDataSource;
let fixtureObject = {
  model: 'IPhone',
  brand: 'Apple'
}

describe('Test all datasouses from ../src/lib/datasouce', () => {
  before(() => {
      dataSource = new inMemoryDataSource();


      //  todo: review this, and add multiply classes structure
      // const filename = './fixtures/dataCorrect.json';
      // dataSource = new FileReadWriteDataSource(filename);
  
      // const brokenFilename = './fixtures/dataIncorrect.doc';
      // brokenDataSource = new FileReadWriteDataSource(brokenFilename);
  
      // const nonExistantFilename = './Test/fixtures/dataCorrect.doc'    
      // nonExistantDataSource = new FileReadWriteDataSource(nonExistantFilename);

      // const emptyFilename = './fixtures/dataEmpty.json';    
      // emptyDataSource = new FileReadWriteDataSource(emptyFilename);
    });

  after(() => {
    console.log('testing END');
  });
  
  describe('#get', ()=> {
    it('should return Promise ', ()=> {
      expect(dataSource.get()).toBeA(Promise);
    });

    it('should resolve with null when key do not exist', ()=> {
      return dataSource.get('test').then((res) => {
        expect(res).toEqual(null);  
      });
    });

    it('should resolve with value for existing key', ()=> {
      return dataSource.get('city').then((res) => {
        expect(res).toEqual('Kyiv');  
      });
    });
  })
  
  describe('#set', ()=> {
    it('should return Promise ', ()=> {
      expect(dataSource.set()).toBeA(Promise);
    });

    it('should resolve with seted key', ()=> {
      return dataSource.set('key', 'value').then((res) => {
        expect(res).toEqual('key');  
      });
    });
  })
  
  describe('#delete', ()=> {
    it('should return Promise ', ()=> {
      expect(dataSource.delete()).toBeA(Promise);
    });

    it('should resolve with true', ()=> {
      return dataSource.delete('key').then((res) => {
        expect(res).toEqual(true);  
      });
    });
  })

  describe('chaining', () => {

    it('set>get - shoud return with seted value', () => {
      return emptyDataSource.set('key', 'value')
        .then(() =>  emptyDataSource.get('key'))
        .then((res) => {
          expect(res).toEqual('value'); 
        });
    });

    it('set>get>delete - shoud return with true', () => {
      return emptyDataSource.set('key', 'value')
        .then(() =>  emptyDataSource.get('key'))
        .then(() =>  emptyDataSource.delete('key'))
        .then((res) => {
          expect(res).toEqual(true); 
        });
    });

    it('set>get>delete>get - shoud return with null', () => {
      return emptyDataSource.set('key', 'value')
        .then(() =>  emptyDataSource.get('key'))
        .then(() =>  emptyDataSource.delete('key'))
        .then(() =>  emptyDataSource.get('key'))
        .then((res) => {
          expect(res).toEqual(null); 
        });
    });

    it('set>get>set>get - shoud return with second seted value', () => {
      return emptyDataSource.set('key', 'value')
        .then(() =>  emptyDataSource.get('key'))
        .then(() =>  emptyDataSource.set('key', 'value1'))
        .then(() =>  emptyDataSource.get('key'))
        .then((res) => {
          expect(res).toEqual('value1'); 
          return emptyDataSource.delete('key')
        });
    });
  });

  describe('#mget', () => {
    it.only('should accept list of IDs as a parameters', () => {
      const spy = expect.createSpy();
      return dataSource.mdelete(fixtureObject)
        .then(spy)
        .catch((err) => {})
        .then((res) => {
          expect(spy).toNotHaveBeenCalled();
          spy.restore();
          return dataSource.mdelete(Object.keys(fixtureObject))
            .then(spy)
            .then((res) => {
              expect(spy).toHaveBeenCalled();
            })
        })
    });
    
    it('should resolve multiple entities by specified list of IDs', () => {
      return dataSource
        .mget(['city'])
        .then((res) => {
          expect(res).toBeAn(Array);
      })
    });

    it('should resolve null for every ID that is not present in datasource', () => {
      return dataSource
        .mget(['Kyiv'])
        .then((res) => {
          expect(res[0]).toEqual(null);
      })
    });
  });

  describe('#mset', () => {
    it.skip('should accept dictionary of IDs to values as a parameters', () => {
      expect(false).toEqual(true);
    });

    it('should resolve a list of IDs that were set', () => {
      return dataSource.mset(fixtureObject).then((res) => {
        expect(res).toEqual(Object.keys(fixtureObject));
      })
    });

    it.skip('should resolve null instead of ID if value was not set', () => {
      
    });
  });

  describe('#mdel', () => {
    it('should accept list of IDs as a parameters', () => {
      const spy = expect.createSpy();
      return dataSource.mdelete(fixtureObject)
        .then(spy)
        .catch((err) => {})
        .then((res) => {
          expect(spy).toNotHaveBeenCalled();
          spy.restore();
          return dataSource.mdelete(Object.keys(fixtureObject))
            .then(spy)
            .then((res) => {
              expect(spy).toHaveBeenCalled();
            })
        })
    });

    it('should resolve with reports of every delete operator', () => {
      return dataSource.mdelete(Object.keys(fixtureObject))
      .then((res) => {
        expect(Object.keys(fixtureObject)).toEqual(Object.keys(res));
      })
    });

    it('should resolve with true if value was removed', () => {
      return dataSource.mset(fixtureObject)
        .then(() => dataSource.mdelete(Object.keys(fixtureObject)))
        .then((res) => {
          Object.keys(fixtureObject).forEach((key,index) => { 
            expect(res[key]).toEqual(true);
          });
        })
    });

    it('should resolve with false if value was not removed', () => {
      return dataSource.mdelete(Object.keys(fixtureObject))
        .then((res) => {
          Object.keys(fixtureObject).forEach(key => {
            expect(res[key]).toEqual(false);
          });
        })
    });
  })
})
