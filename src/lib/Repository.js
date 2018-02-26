'use strict';

const ireq = require('ireq');
const assert = require('assert');

const { InMemoryDatasource } = ireq.lib.datasource('');
const Datasource = ireq.lib('./Datasource');

const attempt = (value, action) => {
  if (value !== null) return value;
  return action();
};

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
      this.datasourceStack = options.datasource.slice(0)
        .sort((a, b) => {
          if (a.readPriority === b.readPriority) return 0;
          return b.readPriority - a.readPriority;
        });
    } else {
      this.datasourceStack = [new InMemoryDatasource()];
    }

    this.writeFirstDatasourceGroup = this.datasourceStack
      .filter(ds => ds.writeMode === Datasource.WRITE_MODE.WRITE_FIRST)
      .sort((a, b) => {
        if (a.writePriority === b.writePriority) return 0;
        return b.writePriority - a.writePriority;
      });

    this.writeAlwaysDatasourceGroup = this.datasourceStack
      .filter(ds => ds.writeMode === Datasource.WRITE_MODE.WRITE_ALWAYS);

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

  /**
   * Get an entity from a Repository.
   * Performs lookup over registered Datasources with respect ro readPriority of those.
   * Attempts to read data from a Datasource with a maximum readPriority.
   * Value is mapped with emtityFactory if the one is specified in constructor.
   * 
   * @param  {any} id   -- identifier of etity to get
   * @return {Promise}  -- resolves with a requested entity or null  
   */
  get(id) {
    const defer = this.datasourceStack.reduce((acc, datasource) => acc
      .then((result) => attempt(result, () => datasource.get(id)))
      .catch((error) => attempt(null, () => datasource.get(id))),
    Promise.resolve(null));

    return this.entityFactory ? 
      defer.then(data => this.entityFactory(data)) : defer;
  }

  /**
   * Save entity within a Repository.
   * Saves data to every WRITE_ALWAYS Datasource
   * Saves data to a single WRITE_FIRST Datasource with a maximum writePriority property
   * Skips NO_WRITE datasource
   * Saves data to cache instead of triggering Datasuurce directly when SYNC_ON_REQUEST or SYNC_ON_TIMEOUT sync strategy chosen
   * 
   * @param {any} id    -- identifier of etity to save
   * @param {any} value -- value to be saved
   * @return {Promise}  -- resolves with an identifier of saved entity or null if entity wasn't saved
   */
  set(id, value) {
    const writeAlwaysDefer = Promise.all(this.writeAlwaysDatasourceGroup.map(ds =>
      ds.set(id, value)));
    const writeFirstDefer = this.writeFirstDatasourceGroup.reduce((acc, datasource) => acc
      .then((result) => attempt(result, () => datasource.set(id, value)))
      .catch((error) => attempt(null, () => datasource.set(id, value))),
    Promise.resolve(null));

    return Promise.all([writeFirstDefer, writeAlwaysDefer])
      .then((report) => {
        if (report[0]) return id;
        return report[1].some(setterReport => !!setterReport) ? id : null;
      })
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
