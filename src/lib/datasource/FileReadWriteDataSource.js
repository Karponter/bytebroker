'use strict';
const fs = require('fs');
const FileReadDataSource = require('./FileReadDataSource');
const Datasource = require('../Datasource')

class FileReadWriteDataSource extends FileReadDataSource, Datasource {
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

} 

module.exports = FileReadWriteDataSource;
