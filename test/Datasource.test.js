'use strict';
const expect = require('expect');
const fs = require('fs');
let fixtureObject = {
  model: 'IPhone',
  brand: 'Apple'
}

const providerDatasourceList = [];
providerDatasourceList.forEach(testDatasourceIntegrity);

const testDatasourceIntegrity = (datasourceRealization) => {

  describe('Test all datasouses from ../src/lib/datasouce', () => {
    before(() => {
      console.log('testing END');
    });

    after(() => {
      console.log('testing END');
    });
    
    describe('#get', ()=> {
      it('should return Promise ', ()=> {
        expect(datasourceRealization.get()).toBeA(Promise);
      });

      it('should resolve with null when key do not exist', ()=> {
        return datasourceRealization.get('test').then((res) => {
          expect(res).toEqual(null);  
        });
      });

      it('should resolve with value for existing key', ()=> {
        return datasourceRealization.get('city').then((res) => {
          expect(res).toEqual('Kyiv');  
        });
      });
    })
    
    describe('#set', ()=> {
      it('should return Promise ', ()=> {
        expect(datasourceRealization.set()).toBeA(Promise);
      });

      it('should resolve with seted key', ()=> {
        return datasourceRealization.set('key', 'value').then((res) => {
          expect(res).toEqual('key');  
        });
      });
    })
    
    describe('#delete', ()=> {
      it('should return Promise ', ()=> {
        expect(datasourceRealization.delete()).toBeA(Promise);
      });

      it('should resolve with true', ()=> {
        return datasourceRealization.delete('key').then((res) => {
          expect(res).toEqual(true);  
        });
      });
    })

    describe('chaining', () => {
      it('set>get - shoud return with seted value', () => {
        return datasourceRealization.set('key', 'value')
          .then(() =>  datasourceRealization.get('key'))
          .then((res) => {
            expect(res).toEqual('value'); 
          });
      });

      it('set>get>delete - shoud return with true', () => {
        return datasourceRealization.set('key', 'value')
          .then(() =>  datasourceRealization.get('key'))
          .then(() =>  datasourceRealization.delete('key'))
          .then((res) => {
            expect(res).toEqual(true); 
          });
      });

      it('set>get>delete>get - shoud return with null', () => {
        return datasourceRealization.set('key', 'value')
          .then(() =>  datasourceRealization.get('key'))
          .then(() =>  datasourceRealization.delete('key'))
          .then(() =>  datasourceRealization.get('key'))
          .then((res) => {
            expect(res).toEqual(null); 
          });
      });

      it('set>get>set>get - shoud return with second seted value', () => {
        return datasourceRealization.set('key', 'value')
          .then(() =>  datasourceRealization.get('key'))
          .then(() =>  datasourceRealization.set('key', 'value1'))
          .then(() =>  datasourceRealization.get('key'))
          .then((res) => {
            expect(res).toEqual('value1'); 
            return datasourceRealization.delete('key')
          });
      });
    });

    describe('#mget', () => {
      it.only('should accept list of IDs as a parameters', () => {
        const spy = expect.createSpy();
        return datasourceRealization.mdelete(fixtureObject)
          .then(spy)
          .catch((err) => {})
          .then((res) => {
            expect(spy).toNotHaveBeenCalled();
            spy.restore();
            return datasourceRealization.mdelete(Object.keys(fixtureObject))
              .then(spy)
              .then((res) => {
                expect(spy).toHaveBeenCalled();
              })
          })
      });
      
      it('should resolve multiple entities by specified list of IDs', () => {
        return datasourceRealization
          .mget(['city'])
          .then((res) => {
            expect(res).toBeAn(Array);
        })
      });

      it('should resolve null for every ID that is not present in datasourceRealization', () => {
        return datasourceRealization
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
        return datasourceRealization.mset(fixtureObject).then((res) => {
          expect(res).toEqual(Object.keys(fixtureObject));
        })
      });

      it.skip('should resolve null instead of ID if value was not set', () => {
        
      });
    });

    describe('#mdel', () => {
      it('should accept list of IDs as a parameters', () => {
        const spy = expect.createSpy();
        return datasourceRealization.mdelete(fixtureObject)
          .then(spy)
          .catch((err) => {})
          .then((res) => {
            expect(spy).toNotHaveBeenCalled();
            spy.restore();
            return datasourceRealization.mdelete(Object.keys(fixtureObject))
              .then(spy)
              .then((res) => {
                expect(spy).toHaveBeenCalled();
              })
          })
      });

      it('should resolve with reports of every delete operator', () => {
        return datasourceRealization.mdelete(Object.keys(fixtureObject))
        .then((res) => {
          expect(Object.keys(fixtureObject)).toEqual(Object.keys(res));
        })
      });

      it('should resolve with true if value was removed', () => {
        return magicClass.mset(fixtureObject)
          .then(() => magicClass.mdelete(Object.keys(fixtureObject)))
          .then((res) => {
            Object.keys(fixtureObject).forEach((key,index) => { 
              expect(res[key]).toEqual(true);
            });
          })
      });

      it('should resolve with false if value was not removed', () => {
        return datasourceRealization.mdelete(Object.keys(fixtureObject))
          .then((res) => {
            Object.keys(fixtureObject).forEach(key => {
              expect(res[key]).toEqual(false);
            });
          })
      });
    })
  })

}
