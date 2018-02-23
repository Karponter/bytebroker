'use strict';

const ireq = require('ireq');

const { InMemoryDatasource } = ireq.lib.datasource('');
const Datasource = ireq.lib('./Datasource');

const assert = require('assert');

class Repository {

  /**
   * Repository instance constructor
   * @param  {Array}    options.datasource
   *         -- stack of datasources to write and read data
   * @param  {Function} options.entityFactory
   *         -- output entity factory, a pipe for eny gatter operation
   * @param  {Number}   options.syncStrategy
   *         -- constant that defines stratagy of communication with datasources
   * @param  {Number}   options.errorProcessingStrategy
   *         -- constant that defines 
   */
  constructor(options) {
    options = options || {};

    this.syncCache = new InMemoryDatasource();
    
    // datasource option processing
    if (options.datasource) {
      options.datasource.forEach(ds =>
        assert(ds instanceof Datasource));
      // shallow copy optional array to prevent side-effects from outside
      this.datasourceStack = options.datasource.slice(0);
    } else {
      this.datasourceStack = [new InMemoryDatasource()];
    }

    // entityFactory option processing
    this.entityFactory = null;
    if (options.entityFactory instanceof Function) {
      this.entityFactory = options.entityFactory;
    }

    this.syncStrategy = options.syncStrategy || 0;
    this.errorPeocessingStrategy = 0;
  }

  _shiftDownCache() {
    this.syncCache.find('*')
      .then(this._shiftDownData)
      .then(haystack => haystack.filter(value => value !== null))
      .then(this.syncCache.mdel);
  }

  _shiftDownData(dataMap) {

    const shiftAsyncDatasources = this.datasourceStack.filter(datasource =>
      datasource.writePriority === Datasource.WRITE_ALWAYS);

    const shiftSyncDatasources = this.datasourceStack.filter(datasource =>
      datasource.writePriority === Datasource.WRITE_FFIRST);

    // ################
    // promiseReduceRace(shiftSyncDatasources.map())
    //   .then()
  }


  get() {
    return Promise.resolve();
  }

  set() {
    return Promise.resolve();
  }

  delete() {
    return Promise.resolve();
  }

  mget() {
    return Promise.resolve();
  }

  mset() {
    return Promise.resolve();
  }

  mdelete() {
    return Promise.resolve();
  }

  getall() {
    return Promise.resolve();
  }

  find() {
    return Promise.resolve();
  }

  sync() {
    return Promise.resolve();
  }

}

Repository.SYNC_STRATEGY = {
  SYNC_ON_REQUEST: 1,
};

module.exports = Repository;
