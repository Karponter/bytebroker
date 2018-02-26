'use strict';
const fs = require('fs');
const FileReadDataSource = require('./FileReadDataSource');
const Datasource = require('../Datasource')

const undefinedToNull = (value) => 
    value === undefined ? null : value;

class FileReadWriteDataSource extends FileReadDataSource {
    constructor(filename) {
        super(filename);
    }

    /**
     * 
     * @param {*} data 
     */
    writeFile(data) {   
        let dataToWrite;
        try{
            dataToWrite = JSON.stringify(data);
        } catch(error){
            return Promise.reject(error);
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(this.fileName, dataToWrite, (writeError) => {
                if (writeError) reject(writeError);
                resolve(true);
            });    
        })
    };
    
    /**
     * 
     * @param {*} key 
     * @param {*} value 
     */
    set(key, value) {  
        let data = {};
        data[key] = value;
        return this.readFile().then((fileData)=> {
            fileData[key] = value;
            return fileData;
        }).then((fileData) => {
            return this.writeFile(fileData);
        }).then(() => key);           
    };

    /**
     * 
     * @param {*} key 
     */
    delete(key) {
        return this.readFile().then((fileData)=> {
            if(!fileData[key]) {
                return false;
            } else {
                fileData[key] = undefined;
                return this.writeFile(fileData).then(() => true);
            };
        });
    }

    /**
     * 
     * @param {*} keysArray 
     */
    mget(keysArray) {
        // todo: set some check if args is not an array
       /* if(typeof keysArray !== 'Array') {
            return Promise.reject(new Error('Error, parameter should be an array of ids'));
        }*/   
        return this.readFile().then((fileData)=> {
            return keysArray.map((key) => fileData[key])
                            .map(undefinedToNull);
        });
    }

    mset(incomingObject) {
        return this.readFile()
            .then((fileData)=> Object.assign(fileData, incomingObject))
            .then((fileData) => this.writeFile(fileData))
            .then(() => Object.keys(incomingObject));           
    }

    mdelete(keysArray) {
        // todo: set some check if args is not an array        
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
            return this.writeFile(fileData).then(() => resultDictionary);
        });
    }

    getall() {
        return this.readFile();
    }
} 

module.exports = FileReadWriteDataSource;
