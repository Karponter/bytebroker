'use strict';
const Datasource = require('../Datasource');
const undefinedToNull = require('../../utils/undefinedToNull')


class InMemoryDatasource extends Datasource{
    constructor(_, options) {
        super(options);
        this.storageMap = new Map();
    }

    /**
     * 
     * @param key 
     */
    get(key) {
        return Promise.resolve(this.storageMap.get(key));
    }

    /**
     * 
     * @param key 
     * @param value 
     */
    set(key, value) {          
        this.storageMap.set(key, value);     
        return Promise.resolve(key);
    }

    /**
     * 
     * @param key 
     */
    delete(key) {
        return Promise.resolve(this.storageMap.delete(key));
    }

    /**
     * 
     * @param {*} keysArray 
     */
    mget(keysArray) {
        const resultsList = keysArray
            .map((key) => this.storageMap.get(key))
            .map(undefinedToNull)
            .map((value, index) => {
                return {[keysArray[index]]: value};
            });
        
        return Promise.resolve(Object.assign({}, ...resultsList));
    }

    /**
     * 
     * @param {*} incomingObject 
     */
    mset(incomingObject) {
        if (!incomingObject) return Promise.resolve([]);

        const incomingObjectKeys = Object.keys(incomingObject);
        incomingObjectKeys.forEach((key) => {
            this.storageMap.set(key, incomingObject[key]);
        });

        return Promise.resolve(incomingObjectKeys);
    }

    /**
     * 
     * @param {*} keysArray 
     */
    mdelete(keysArray) {
        if (!keysArray) return Promise.resolve([]);
        let resultArray = [];
        try {
            resultArray = keysArray
                .map((key) => [key, this.storageMap.delete(key)])
                .filter((report) => report[1])
                .map((report) => report[0]);
        } catch (e) {
            return Promise.reject(new Error(e));
        }

        return Promise.resolve(resultArray);
    }

    getall() {
        return Promise.resolve(Array.from(this.storageMap.keys()));
    }
}
module.exports = InMemoryDatasource;

