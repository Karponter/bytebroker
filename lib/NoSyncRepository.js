'use strict';

const ireq = require('ireq');
const assert = require('assert');

const { InMemoryDatasource } = ireq.lib.datasource('');
const Datasource = ireq.lib('./Datasource');
const SYNC_STRATEGY = ireq.lib.constants('./sync-strategy');
const { attempt } = ireq.utils('');

class NoSyncRepository {

  /**
   * NoSyncRepository instance constructor
   * @param  {Array}    options.datasource
   *         -- stack of datasources to write and read data
   * @param  {Function} options.entityFactory
   *         -- output entity factory, a pipe for eny gatter operation
   * @param  {Number}   options.syncStrategy
   *         -- constant that defines stratagy of communication with datasources
   * @param  {Number}   options.errorProcessingStrategy
   *         -- constant that defines
   */
  constructor(options = {}) {
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

    // entityFactory option processing
    this.entityFactory = null;
    if (options.entityFactory instanceof Function) {
      this.entityFactory = options.entityFactory;
    }

    this.syncStrategy = options.syncStrategy || 0;
    this.errorPeocessingStrategy = 0;
  }

  /**
   * Get an entity from a Repository.
   * Performs lookup over registered Datasources with respect ro readPriority of those.
   * Attempts to read data from a Datasource with a maximum readPriority.
   * Value is mapped with emtityFactory if the one is specified in constructor.
   *
   * @param  {any} id   -- identifier of entity to get
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
   * Does nothing, left for interface conveience
   *
   * @return {Promise}  -- resolves with null
   */
  set() {
    return Promise.resolve(null);
  }

  /**
   * Does nothing, left for interface conveience
   * 
   * @return {Promise}    -- resolves with false
   */
  delete() {
    return Promise.resolve(false);
  }

  /**
   * Get multiple entities from a Repository.
   * Performs lookup over registered Datasources with respect ro readPriority of those.
   * Attempts to read data from a Datasource with a maximum readPriority.
   * Value is mapped with emtityFactory if the one is specified in constructor.
   *
   * @param  {Array<any>} ids   -- list of entity identifiers
   * @return {Promise}          -- resolves with key-value mapping of ids to entities
   */
  mget(ids) {
    const sufficienceSet = new Set(ids);

    const atomicMgetAction = (ds, ids) => {
      return (ds.mget !== undefined) ? ds.mget(ids) :
        Promise.all(ids.map(id => ds.get(id)));
    };

    const datasourceMgetReducer = (acc, datasource, INDEX) => acc
      .then((result) => {
        const processedKeys = result ?
          Object.keys(result).filter((key) => result[key] !== null) : [];
        processedKeys.forEach(key => sufficienceSet.delete(key));

        if (sufficienceSet.size <= 0) {
          return Promise.resolve(result);
        }

        const furtherIds = Array.from(sufficienceSet);
        const processedResult = processedKeys.reduce((acc, key) => {
          acc[key] = result[key];
          return acc;
        }, {});

        return atomicMgetAction(datasource, furtherIds)
          .then((furtherResult) => Object.assign({}, furtherResult, processedResult));
      })
      .catch((error) => atomicMgetAction(datasource, ids))

    const defer = this.datasourceStack.reduce(datasourceMgetReducer, Promise.resolve(null));

    if (!this.entityFactory) {
      return defer;
    }

    return defer.then((deferResult) => {
      Object.keys(deferResult).forEach((key) =>
        deferResult[key] = this.entityFactory(deferResult[key]));
      return deferResult;
    });
  }

  /**
   * Does nothing, left for interface conveience
   *
   * @return {Promise} -- resolves with empty list
   */
  mset() {
    return Promise.resolve([]);
  }

  /**
   * Does nothing, left for interface conveience
   * 
   * @return {Promise} -- resolves with empty dictionary
   */
  mdelete() {
    return Promise.resolve({});
  }

  /**
   * List all keys that available all over the Datasources
   * 
   * @return {Promise}    -- resolves with list of available keys
   */
  getall() {
    return Promise.all(this.datasourceStack.map((ds) => ds.getall()))
      .then((reportsLits) => {
        const unicKeysSet = new Set();
        reportsLits.forEach((report) => {
          report.forEach(key => unicKeysSet.add(key));
        });

        return Array.from(unicKeysSet);
      });
  }

  /**
   * Search througth available keys using regular expression
   *
   * @param  {RegExp}   selector  -- regular xepression to test keys
   * @return {Promise}            -- resolves with list of matching keys
   */
  find(selector) {
    const atomicFindCation = (ds, selector) => {
      if (ds.find === undefined) {
        return Promise.resolve([]);
      }
      return ds.find(selector);
    };

    return Promise.all(this.datasourceStack.map((ds) => atomicFindCation(ds, selector)))
      .then((reportsLits) => {
        const unicKeysSet = new Set();
        reportsLits.forEach((report) => {
          report.forEach(key => unicKeysSet.add(key));
        });

        return Array.from(unicKeysSet);
      });
  }

  sync() {
    return Promise.resolve(false);
  }

}

module.exports = NoSyncRepository;
