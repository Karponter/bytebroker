const expect = require('expect');
const fs = require('fs');
const FileReadWriteDataSource = require('../src/lib/FileReadWriteDataSource');

let dataSource, data;

describe('FileReadWriteDataSource', ()=>{
    before(()=>{
        const filename = './tests/fixtures/fixtureDataCorrect.json';
        dataSource = new FileReadWriteDataSource(filename);
        
        const filenameWithoutPermissioToWrite = '/root/';
        dataSourceWithoutPermissionToWrite = new FileReadWriteDataSource(filenameWithoutPermissioToWrite);
        data = {
            city: 'Kyiv',
            state: 'Ukraine'
        }
    });
    after(()=>{

    })

    describe('#writeData',() =>{
        it('should return promise', () => {
            expect(dataSource.writeFile(data)).toBeA(Promise);
        });

        it('should resolve when file has been written', () => {
            return dataSource.writeFile(data).then(resolve => {
                expect(resolve).toEqual(true);
            })
        });

        it('should reject when file was written with error', () => {
            const spy = expect.createSpy();
            return dataSourceWithoutPermissionToWrite.writeFile(data).then(spy)
                .catch(writeError => {
                    expect(writeError).toBeA(Error);
                }).then(res => {
                    expect(spy).toNotHaveBeenCalled();
                })
        });
    });

    describe('#set', () => {
        it('should return promise', () => {
            expect(dataSource.set('test', 'val')).toBeA(Promise);
        });
        it('should resolve with setted key', () => {
            return dataSource.set('test', 'val').then((response) => {
                expect(response).toEqual('test');                        
            })
        });
    });

    describe('#delete', () => {
        it('should resolve with promise', () => {
            expect(dataSource.delete('test')).toBeA(Promise);
        });
        it('should resolve with false, when key do not deleted', () => {
            dataSource.delete('val').then((response) => {
                expect(response).toEqual(false);
            });
        });
        it('should resolve with true, when key was deleted', () => {
            dataSource.delete('city').then((response) => {
                expect(response).toEqual(true);
            });
        });
    })
});

