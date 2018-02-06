const expect = require('expect');
const fs = require('fs');
const FileReadDataSource = require('../FileReadDataSource');

let dataSource, brokenDataSource, nonExistantDataSource;

describe('FileReadDataSource', () => {
  before(() => {
    const filename = './tests/fixtures/fixtureDataCorrect.json';
    dataSource = new FileReadDataSource(filename);

    const brokenFilename = './tests/fixtures/fixtureData.doc';
    brokenDataSource = new FileReadDataSource(brokenFilename);

    const nonExistantFilename = './Test/fixtures/fixtureData.doc'    
    nonExistantDataSource = new FileReadDataSource(nonExistantFilename);
  });
  after(() => {
    console.log('testing END');
  });

  describe('#ReadFile', () => {
    it('should return Promise', () => {
      expect(dataSource.readFile()).toBeA(Promise);
    });
    
    it('should resolve with key-value data mapping', () => {
      return dataSource.readFile().then((res) => {
        expect(res).toBeAn('object');  
        expect(res).toIncludeKeys(['city', 'state']);    
      });
    });

    it('should reject if target file contains invalid data', () => {
      const spy = expect.createSpy();
      return brokenDataSource.readFile().then(spy)
        .catch((err) => {
          expect(err).toBeAn(Error);      
        }).then(() => {
          expect(spy).toNotHaveBeenCalled();
        });
    });

    it('should reject if target file do not exist', () => {
      const spy = expect.createSpy();
      return nonExistantDataSource.readFile().then(spy)
        .catch((err) => {
          expect(err).toBeAn(Error);      
        }).then(() => {
          expect(spy).toNotHaveBeenCalled();
        });    
    });
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


});