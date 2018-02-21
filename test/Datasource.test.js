'use strict';
const expect = require('expect');
const fs = require('fs');
const FileReadWriteDataSource = require('../src/lib/datasource/FileReadWriteDataSource');

let dataSource, brokenDataSource, nonExistantDataSource, emptyDataSource;

describe('Test all datasouses from ../src/lib/datasouce', () => {
  before(() => {
      //  todo: review this, and add multiply classes structure
      const filename = './fixtures/dataCorrect.json';
      dataSource = new FileReadWriteDataSource(filename);
  
      const brokenFilename = './fixtures/dataIncorrect.doc';
      brokenDataSource = new FileReadWriteDataSource(brokenFilename);
  
      const nonExistantFilename = './Test/fixtures/dataCorrect.doc'    
      nonExistantDataSource = new FileReadWriteDataSource(nonExistantFilename);

      const emptyFilename = './fixtures/dataEmpty.json';    
      emptyDataSource = new FileReadWriteDataSource(emptyFilename);
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
    it('should return Promise and resolve with a null', () => {
      return emptyDataSource.get('key').then((res) => {
        expect(emptyDataSource.get('key')).toBeA(Promise);
        expect(res).toEqual(null);  
      });
    });

    it('set>get shoud return with seted value', () => {
      return emptyDataSource.set('key', 'value')
        .then(() =>  emptyDataSource.get('key'))
        .then((res) => {
          expect(res).toEqual('value'); 
        });
    });

    it('set>get>delete shoud return with true', () => {
      return emptyDataSource.set('key', 'value')
        .then(() =>  emptyDataSource.get('key'))
        .then(() =>  emptyDataSource.delete('key'))
        .then((res) => {
          expect(res).toEqual(true); 
        });
    });

    it('set>get>delete>get shoud return with null', () => {
      return emptyDataSource.set('key', 'value')
        .then(() =>  emptyDataSource.get('key'))
        .then(() =>  emptyDataSource.delete('key'))
        .then(() =>  emptyDataSource.get('key'))
        .then((res) => {
          expect(res).toEqual(null); 
        });
    });

    it('set>get>set>get shoud return with second seted value', () => {
      return emptyDataSource.set('key', 'value')
        .then(() =>  emptyDataSource.get('key'))
        .then(() =>  emptyDataSource.set('key', 'value1'))
        .then(() =>  emptyDataSource.get('key'))
        .then((res) => {
          expect(res).toEqual('value1'); 
          return emptyDataSource.delete('key')
        });
    });
  })
})
