'use strict';
const Datasource = require('../Datasource');

class InMemoryDatasource extends Datasource {
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
}
module.exports = InMemoryDatasource;