'use strict';
const ireq = require('../src/ireq');
const InMemoryDatasource = ireq.lib.datasource('./InMemoryDatasource');
const expect = require('expect');

const datasource = new InMemoryDatasource();
describe('InMemoryDatasource', () => {
    before(() => {
        return datasource.mset({
            city: 'Kyiv',
            state: 'Ukraine',
            region: 'Poltava'
        });
    });

    describe('#find', () => {
        it('should resolve with key-value object for RegExp(*)', () => {
            return datasource.find(new RegExp('')).then((foundValues) => {
                expect(foundValues).toEqual({
                    city: 'Kyiv',
                    state: 'Ukraine',
                    region: 'Poltava'
                });
            });
        });

        it('should resolve with key-value object for RegExp(true data)', () => {
            return datasource.find(new RegExp('y')).then((foundValues) => {
                expect(foundValues).toEqual({city: 'Kyiv'});
            });
        });

        it('should resolve with key-value object for string as a params and without flags', () => {
            return datasource.find('e').then((foundValues) => {
                expect(foundValues).toEqual({
                    state: 'Ukraine',
                    region: 'Poltava'
                });
            });
        });

        it('should resolve with key-value object for string as a params and with flags', () => {
            return datasource.find('STATE', 'i').then((foundValues) => {
                expect(foundValues).toEqual({
                    state: 'Ukraine'
                });
            });
        });
    });
});