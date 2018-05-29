'use strict';

const ireq = require('ireq');
const assert = require('assert');

const SyncOnUpdateRepository = ireq.lib('./SyncOnUpdateRepository');

const { InMemoryDatasource, SyncCacheDatasource } = ireq.lib.datasource('');
const Datasource = ireq.lib('./Datasource');
const SYNC_STRATEGY = ireq.lib.constants('./sync-strategy');
const { attempt } = ireq.utils('');

const isTruthly = value => !!value;

class SyncOnRequestRepository extends SyncOnUpdateRepository {

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

    this._syncCache = new SyncCacheDatasource();

    this.datasourceStack.unshift(this._syncCache);

    // this.writeFirstDatasourceGroup = this.datasourceStack
    //   .filter(ds => ds.writeMode === Datasource.WRITE_MODE.WRITE_FIRST)
    //   .sort((a, b) => {
    //     if (a.writePriority === b.writePriority) return 0;
    //     return b.writePriority - a.writePriority;
    //   });

    // this.writeAlwaysDatasourceGroup = this.datasourceStack
    //   .filter(ds => ds.writeMode === Datasource.WRITE_MODE.WRITE_ALWAYS);

    // this.writeAllowedDatasourceGroup = this.datasourceStack
    //   .filter(ds => ds.writeMode !== Datasource.WRITE_MODE.NO_WRITE);
  }

  /**
   * [set description]
   * @param {[type]} id    [description]
   * @param {[type]} value [description]
   * @return {[type]}    [description]
   */
  set(id, value) {
    return this._syncCache.set(id, value);
  }

  /**
   * [delete description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  delete(id) {
    return this._syncCache.markAsRemoved(id);
  }

  /**
   * [mset description]
   * @param  {[type]} payload [description]
   * @return {[type]}         [description]
   */
  mset(payload) {
    return Promise.all(Object.keys(payload).map((id) => {
      const value = payload[id];
      return this.set(id, value);
    }));
  }

  /**
   * [delete description]
   * @param  {[type]} ids [description]
   * @return {[type]}     [description]
   */
  mdelete(ids) {
    return Promise.all(ids.map(id => this.delete(id)));
  }

  sync() {
    return Promise.resolve(false);
  }

}

module.exports = SyncOnRequestRepository;
