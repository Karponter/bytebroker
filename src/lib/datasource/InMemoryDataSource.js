'use strict';
const Datasource = require('../Datasource');


const undefinedToNull = (value) => 
    value === undefined ? null : value;

class InMemoryDatasource extends Datasource{
    constructor() {
        super();
        this.storageMap = new Map();
    }

    /**
     * 
     * @param key 
     */
    get(key) {
        return Promise.resolve(this.storageMap.get(key))
    }

    /**
     * 
     * @param key 
     * @param value 
     */
    set(key, value) {               
        return Promise.resolve(this.storageMap.set(key, value));
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
        return Promise.resolve( keysArray.map((key) => this.storageMap.get(key))
                                            .map(undefinedToNull));
    }

    /**
     * 
     * @param {*} incomingObject 
     */
    mset(incomingObject) {
        const incomingObjectKeys = Object.keys(incomingObject);
        incomingObjectKeys.forEach((key) => {
            this.storageMap.set(key, incomingObject[key]);
        })
        return Promise.resolve(incomingObjectKeys);
    }

    /**
     * 
     * @param {*} keysArray 
     */
    mdelete(keysArray) {
        return Promise.resolve(keysArray.map((key) => ({key: this.storageMap.delete(key)})));

    }
}
module.exports = InMemoryDatasource;
