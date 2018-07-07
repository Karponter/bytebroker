'use strict';
const fs = require('fs');
const Datasource = require('../Datasource');

const undefinedToNull = (value) => value === undefined ? null : value;

class JsonReadonlyDatasource extends Datasource {
    
    constructor(fileName, options) {
        super(options);
        this.fileName = fileName;
    }

    readFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.fileName, (readError, data) => {
                if (readError) return reject(readError);
                try {
                    const result = JSON.parse(data);
                    return resolve(result);
                } catch(parsingError) {
                    return reject(parsingError);
                }
            });
        });
    }

    /**
     * Get from json file some value
    */
    get(key) {
        return this.readFile().then(response => {
            return response[key] !== undefined ? response[key] : null;
        });
    }

    set() {
        return Promise.resolve(null);
    }

    delete() {
        return Promise.resolve(null);
    }

    mget(keysArray) {
        return this.readFile()
            .then((fileData) => keysArray.reduce((result, key) => {
                result[key] = undefinedToNull(fileData[key]);
                return result;
            }, {}));
    }

} 

module.exports = JsonReadonlyDatasource;
