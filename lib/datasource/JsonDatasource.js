'use strict';
const fs = require('fs');
const createIfNotExist = require('create-if-not-exist');
const Queue = require('promise-queue');
 
const JsonReadonlyDatasource = require('./JsonReadonlyDatasource');
const Datasource = require('../Datasource')

const undefinedToNull = (value) => value === undefined ? null : value;

const INITIAL_FILE_CONTENT = '{}';

class JsonDatasource extends JsonReadonlyDatasource {    
    /**
     * [constructor description]
     * @param  {[type]} fileName [description]
     * @param  {[type]} options  [description]
     * @return {[type]}          [description]
     */
    constructor(fileName, options = {}) {
        super(fileName, options);
        if (options.forceEmptyFile) {
            fs.writeFileSync(fileName, INITIAL_FILE_CONTENT);
        } else {
            createIfNotExist(fileName, INITIAL_FILE_CONTENT);
        }
        this.fileAccessQueue = new Queue(1, Infinity);
    }

    /**
     * 
     * @param {*} data 
     */
    writeFile(data) {
        let dataToWrite;
        try {
            dataToWrite = JSON.stringify(data);
        } catch (error) {
            return Promise.reject(error);
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(this.fileName, dataToWrite, (writeError) => {
                if (writeError) reject(writeError);
                resolve(true);
            });    
        });
    };
    
    /**
     * 
     * @param {*} key 
     * @param {*} value 
     */
    set(key, value) {
        return this.fileAccessQueue.add(() => {
            return this.readFile().then((fileData)=> {
                fileData[key] = value;
                return fileData;
            }).then((fileData) => {
                return this.writeFile(fileData);
            }).then(() => key);
        });
    };

    /**
     * 
     * @param {*} key 
     */
    delete(key) {
        return this.fileAccessQueue.add(() => {
            return this.readFile().then((fileData)=> {
                if(!fileData[key]) {
                    return false;
                } else {
                    fileData[key] = undefined;
                    return this.writeFile(fileData).then(() => true);
                };
            });
        });
    }

    mset(incomingObject) {
        return this.fileAccessQueue.add(() => {
            return this.readFile()
                .then((fileData)=> Object.assign(fileData, incomingObject))
                .then((fileData) => this.writeFile(fileData))
                .then(() => Object.keys(incomingObject));           
        });
    }

    mdelete(keysArray) {
        // todo: set some check if args is not an array        
        return this.fileAccessQueue.add(() => {
            return this.readFile().then((fileData)=> {
                let resultDictionary = {};
                keysArray.forEach((key) => {
                    if(fileData[key] !== undefined) {
                        resultDictionary[key] = true;
                        fileData[key] = undefined;
                    } else {
                        resultDictionary[key] = false;                    
                    }
                });
                return this.writeFile(fileData).then(() => Object.keys(resultDictionary));
            });
        });
    }

    getall() {
        return this.readFile()
            .then((data) => {
                return data && Object.keys(data)
            });
    }
} 

module.exports = JsonDatasource;
