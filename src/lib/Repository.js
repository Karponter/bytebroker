'use strict';

const { InMemoryDatasource, Datasource } = ireq.lib.datasource('');
const assert = require('assert');

class Repository {

  /**
   * Repository instance constructor
   * @param  {Array}    options.datasource
   *         -- stack of datasources to write and read data
   * @param  {Function} options.entityProvider
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
      options.datasource.forEach(datasource =>
        assert(datasource instanceof Datasource));
      // shallow copy optional array to prevent side-effects from outside
      this.datasourceStack = options.datasource.slice(0);
    } else {
      this.datasourceStack = [new InMemoryDatasource()];
    }

    // entityProvider option processing
    this.entityProvider = null;
    if (options.entityProvider instanceof Function) {
      this.entityProvider = options.entityProvider;
    }
  }

  _shiftDownCache() {
    this.syncCache.find('*')
      .then(this._shiftDownData)
      .then(haystack => haystack.filter(value => value !== null));
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

  _attemptToWrite

  get() {}

  set() {}

  del() {}

  mget() {}

  mset() {}

  mdel() {}

  find() {}

  sync() {}

}

module.exports = Repository;
