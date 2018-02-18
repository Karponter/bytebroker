'use strict';
const fs = require('fs');
const Datasource = require('../Datasource');

class FileReadDataSource extends Datasource {
    
    constructor(fileName) {
        super();
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
        })
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

} 

module.exports = FileReadDataSource;
