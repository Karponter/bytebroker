'use strict';
const expect = require('expect');
const fixtureObject = {
  model: 'IPhone',
  brand: 'Apple'
};

const testDatasourceIntegrity = (DatasourceDefinition, instantinationAarguments) => {

  const createDatasource = () =>
    new DatasourceDefinition(instantinationAarguments);

  let datasource = createDatasource();
  const title = datasource.constructor.name;

  describe(`Testing integrity of ${title}`, () => {

    describe('#set', () => {
      it('should return Promise ', () => {
        expect(datasource.set('key', 'value')).toBeA(Promise);
      });

      it('should resolve with seted key', () => {
        return datasource.set('key', 'value').then((res) => {
          expect(res).toEqual('key');
        });
      });
    });

    describe('#get', () => {
      it('should return Promise ', () => {
        expect(datasource.get()).toBeA(Promise);
      });

      it('should resolve with null when key do not exist', () => {
        return datasource.get('test').then((res) => {
          expect(res).toEqual(null);
        });
      });

      it('should resolve with value for existing key', () => {
        return datasource
          .set('city', 'Kyiv')
          .then(() => datasource.get('city'))
          .then(res => expect(res).toEqual('Kyiv'));
      });
    });
    
    describe('#delete', () => {
      it('should return Promise ', () => {
        expect(datasource.delete()).toBeA(Promise);
      });

      it('should resolve with true', () => {
        return datasource.delete('key').then((res) => {
          expect(res).toEqual(true);  
        });
      });
    });

    describe('#getall', () => {
      it('should return Promise ', () => {
        expect(datasource.getall()).toBeA(Promise);
      });

      it('should resolve with list  of all available keys', () => {
        const datasource = createDatasource();
        return Promise.all([
          datasource.set('key1', 'value1'),
          datasource.set('key2', 'value2'),
          datasource.set('weird-key', 'value3'),
        ])
          .then(() => datasource.getall())
          .then(result => {
            expect(result).toBeAn(Array);
            expect(result).toEqual(['key1', 'key2', 'weird-key']);
          });
      });
    });

    describe('#find', () => {
      it('should return Promise ', () => {
        expect(datasource.find('')).toBeA(Promise);
      });
    });

    describe('#mget', () => {
      it('should accept list of IDs as a parameters', () => {
        const spy = expect.createSpy();
        return datasource.mdelete(fixtureObject)
          .then(spy)
          .catch((err) => {})
          .then((res) => {
            expect(spy).toNotHaveBeenCalled();
            spy.restore();
            return datasource.mdelete(Object.keys(fixtureObject))
              .then(spy)
              .then((res) => {
                expect(spy).toHaveBeenCalled();
              })
          })
      });
      
      it('should resolve multiple entities by specified list of IDs', () => {
        return datasource
          .mget(['city'])
          .then((res) => {
            expect(res).toIncludeKeys(['city']);
        })
      });

      it('should resolve null for every ID that is not present in datasource', () => {
        return datasource
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
        return datasource.mset(fixtureObject)
          .then((res) => {
            expect(res).toEqual(Object.keys(fixtureObject));
          })
      });

      it.skip('should resolve null instead of ID if value was not set', () => {
        
      });
    });

    describe('#mdel', () => {
      it('should accept list of IDs as a parameters', () => {
        const spy = expect.createSpy();
        return datasource.mdelete(fixtureObject)
          .then(spy)
          .catch((err) => {})
          .then((res) => {
            expect(spy).toNotHaveBeenCalled();
            spy.restore();
            return datasource.mdelete(Object.keys(fixtureObject))
              .then(spy)
              .then((res) => {
                expect(spy).toHaveBeenCalled();
              })
          })
      });

      it('should resolve with reports of every delete operator', () => {
        return datasource.mdelete(Object.keys(fixtureObject))
        .then((res) => {
          expect(Object.keys(fixtureObject)).toEqual(Object.keys(res));
        })
      });

      it('should resolve with true if value was removed', () => {
        return datasource.mset(fixtureObject)
          .then(() => datasource.mdelete(Object.keys(fixtureObject)))
          .then((res) => {
            Object.keys(fixtureObject).forEach((key,index) => { 
              expect(res[key]).toEqual(true);
            });
          })
      });

      it('should resolve with false if value was not removed', () => {
        return datasource.mdelete(Object.keys(fixtureObject))
          .then((res) => {
            Object.keys(fixtureObject).forEach(key => {
              expect(res[key]).toEqual(false);
            });
          })
      });
    });

    describe('chaining', () => {
      it('set>get - shoud return with seted value', () => {
        return datasource.set('key', 'value')
          .then(() =>  datasource.get('key'))
          .then((res) => {
            expect(res).toEqual('value'); 
          });
      });

      it('set>get>delete - shoud return with true', () => {
        return datasource.set('key', 'value')
          .then(() =>  datasource.get('key'))
          .then(() =>  datasource.delete('key'))
          .then((res) => {
            expect(res).toEqual(true); 
          });
      });

      it('set>get>delete>get - shoud return with null', () => {
        return datasource.set('key', 'value')
          .then(() =>  datasource.get('key'))
          .then(() =>  datasource.delete('key'))
          .then(() =>  datasource.get('key'))
          .then((res) => {
            expect(res).toEqual(null); 
          });
      });

      it('set>get>set>get - shoud return with second seted value', () => {
        return datasource.set('key', 'value')
          .then(() =>  datasource.get('key'))
          .then(() =>  datasource.set('key', 'value1'))
          .then(() =>  datasource.get('key'))
          .then((res) => {
            expect(res).toEqual('value1'); 
            return datasource.delete('key')
          });
      });
    });
  });
};

module.exports = testDatasourceIntegrity;
