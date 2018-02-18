'use strict';
const expect = require('expect');
const fs = require('fs');
const FileReadDataSource = require('../src/lib/datasource/FileReadDataSource');

let dataSource, brokenDataSource, nonExistantDataSource;

describe('Test all datasouses from ../src/lib/datasouce', () => {
    before(() => {
        //  todo: review this, and add multiply classes structure
        const filename = './fixtures/dataCorrect.json';
        dataSource = new FileReadDataSource(filename);
    
        const brokenFilename = './fixtures/dataIncorrect.doc';
        brokenDataSource = new FileReadDataSource(brokenFilename);
    
        const nonExistantFilename = './Test/fixtures/dataCorrect.doc'    
        nonExistantDataSource = new FileReadDataSource(nonExistantFilename);
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
    
        it('should resolve with null', ()=> {
          return dataSource.set().then((res) => {
            expect(res).toEqual(null);  
          });
        });
      })
    
      describe('#delete', ()=> {
        it('should return Promise ', ()=> {
          expect(dataSource.delete()).toBeA(Promise);
        });
    
        it('should resolve with null', ()=> {
          return dataSource.delete().then((res) => {
            expect(res).toEqual(null);  
          });
        });
      })

})
