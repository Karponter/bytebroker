'use strict';

const ireq = require('ireq');
const assert = require('assert');

const NoSyncRepository = ireq.lib('./NoSyncRepository');

const { InMemoryDatasource } = ireq.lib.datasource('');
const Datasource = ireq.lib('./Datasource');
const SYNC_STRATEGY = ireq.lib.constants('./sync-strategy');
const { attempt } = ireq.utils('');

const isTruthly = value => !!value;

class SyncOnUpdateRepository extends NoSyncRepository {

  /**
   * SyncOnUpdateRepository instance constructor
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
    super(options);

    this.writeFirstDatasourceGroup = this.datasourceStack
      .filter(ds => ds.writeMode === Datasource.WRITE_MODE.WRITE_FIRST)
      .sort((a, b) => {
        if (a.writePriority === b.writePriority) return 0;
        return b.writePriority - a.writePriority;
      });

    this.writeAlwaysDatasourceGroup = this.datasourceStack
      .filter(ds => ds.writeMode === Datasource.WRITE_MODE.WRITE_ALWAYS);

    this.writeAllowedDatasourceGroup = this.datasourceStack
      .filter(ds => ds.writeMode !== Datasource.WRITE_MODE.NO_WRITE);
  }

  /**
   * Save entity within a Repository.
   * Saves data to every WRITE_ALWAYS Datasource
   * Saves data to a single WRITE_FIRST Datasource with a maximum writePriority property
   * Skips NO_WRITE datasource
   * Saves data to cache instead of triggering Datasource directly when SYNC_ON_REQUEST or SYNC_ON_TIMEOUT sync strategy chosen.
   *
   * @param {any} id    -- identifier of entity to save
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
        return report[1].some(isTruthly) ? id : null;
      });
  }

  /**
   * Delete entity from a Repository.
   * Removes data from each datasource except those that marked as NO_WRITE.
   * Saves data to cache instead of triggering Datasource directly when SYNC_ON_REQUEST or SYNC_ON_TIMEOUT sync strategy chosen.
   *
   * @param  {any} id     -- identifier of entity to remove
   * @return {Promise}    -- resolves with true if removal operation was performed and false if it wasn't
   */
  delete(id) {
    return Promise.all(this.datasourceStack
      .filter(ds => ds.writeMode !== Datasource.WRITE_MODE.NO_WRITE)
      .map(ds => ds.delete(id)))
    .then(operationReports => operationReports.some(isTruthly));
  }

  /**
   * Save multiple entities within a Repository.
   * Mitigates #set logic fluently
   * Use #set method directly if datasource have no #mset implemented
   *
   * @param  {Object<id => value>} payload  -- represents values that should be saved under id
   * @return {Promise}                      -- resolves with list of seted ids
   */
  mset(payload) {
    const atomicMsetAction = (ds, payload) => {
      return (ds.mset !== undefined) ? ds.mset(payload) :
        Promise.all(Object.keys(payload).map(id => ds.set(id, payload[id])));
    };

    const writeAlwaysDefer = Promise.all(this.writeAlwaysDatasourceGroup.map((ds) =>
      atomicMsetAction(ds, payload)));
    const writeFirstDefer = this.writeFirstDatasourceGroup.reduce((acc, datasource) => acc
      .then((result) => attempt(result, () => atomicMsetAction(datasource, payload)))
      .catch((error) => attempt(null, () => atomicMsetAction(datasource, payload))),
    Promise.resolve(null));

    return Promise.all([writeFirstDefer, writeAlwaysDefer])
      .then((report) => {

        const resultingSet = new Set(report[0].concat(...report[1]));
        return Array.from(resultingSet);
      });
    return Promise.resolve();
  }

  /**
   * Delete multiple entities from repository
   * Removes data from each datasource except those that marked as NO_WRITE.
   * Saves data to cache instead of triggering Datasource directly when SYNC_ON_REQUEST or SYNC_ON_TIMEOUT sync strategy chosen.
   * 
   * @param  {Array<any>} ids   -- list of entity identifiers
   * @return {Promise}          -- resolves with key-value mapping with id's and true, if value was removed
   */
  mdelete(ids) {
    const fluentDefer = Promise.all(this.writeAllowedDatasourceGroup.map((ds) => {
      return (ds.mdelete !== undefined) ? ds.mdelete(ids) :
        Promise.all(ids.map(id => ds.delete(id)))
          .then((results) => results.reduce((acc, result, index) => {
            acc[ids[index]] = result;
            return acc;
          }, {}));
    }));

    return fluentDefer.then((reports) => {
      return reports.reduce((acc, report) => {
        Object.keys(report).forEach((key) => acc[key] = acc[key] || report[key]);
        return Object.assign({}, report, acc);
      }, {});
    });
  }

  sync() {
    return Promise.resolve(false);
  }

}

SyncOnUpdateRepository.SYNC_STRATEGY = SYNC_STRATEGY;

module.exports = SyncOnUpdateRepository;
