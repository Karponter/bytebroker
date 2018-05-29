'use strict';

const ireq = require('ireq');
const assert = require('assert');

const SyncOnUpdateRepository = ireq.lib('./SyncOnUpdateRepository');

const { InMemoryDatasource } = ireq.lib.datasource('');
const Datasource = ireq.lib('./Datasource');
const SYNC_STRATEGY = ireq.lib.constants('./sync-strategy');
const { attempt } = ireq.utils('');

const ACTIONS = {
  SET: 'set',
  DELETE: 'delete',
};

const isTruthly = value => !!value;
const wrapCacheSetter = value => ({ action: ACTIONS.SET, value });

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

    this._syncCache = new InMemoryDatasource();

    // this.datasourceStack.unshift(this._syncCache);
  }

  /**
   * [set description]
   * @param {[type]} id    [description]
   * @param {[type]} value [description]
   * @return {[type]}    [description]
   */
  set(id, value) {
    const wrappedValue = wrapCacheSetter(value);
    return this._syncCache.set(id, wrappedValue);
  }

  /**
   * [get description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  get(id) {
    return this._syncCache.get(id)
      .then((wrappedValue) => {
        if (!wrappedValue) return super.get(id);
        if (wrappedValue.action === ACTIONS.DELETE) return null;
        if (wrappedValue.action === ACTIONS.SET) return wrappedValue.value;
        throw new Error(`Unexpected wrapped value met in sync cache under id: ${id}`);
      });
  }

  /**
   * [delete description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  delete(id) {
    return this._syncCache.set(id, { action: ACTIONS.DELETE });
  }

  /**
   * [find description]
   * @param  {[type]} regexp [description]
   * @param  {[type]} flags  [description]
   * @return {[type]}        [description]
   */
  find(regexp, flags) {
    const context = {};

    return super.find(regexp, flags)
      .then((dsKeys) => context.dsKeys = dsKeys)
      .then(() => this._syncCache.find(regexp, flags))
      .then((keys) => this._syncCache.mget(keys))
      .then((cachePayload) => {
        const resultingKeys = new Set(context.dsKeys);
        Object.keys(cachePayload).forEach((key) => {
          const value = cachePayload[key];
          if (value && value.action === ACTIONS.SET)
            return resultingKeys.add(key);
          if (value && value.action === ACTIONS.DELETE)
            return resultingKeys.delete(key);
        });

        return Array.from(resultingKeys);
      });
  }

  /**
   * [getall description]
   * @return {[type]} [description]
   */
  getall() {
    const context = {};

    return super.getall()
      .then((dsKeys) => context.dsKeys = dsKeys)
      .then(() => this._syncCache.getall())
      .then((keys) => this._syncCache.mget(keys))
      .then((cachePayload) => {
        const resultingKeys = new Set(context.dsKeys);
        Object.keys(cachePayload).forEach((key) => {
          const value = cachePayload[key];
          if (value && value.action === ACTIONS.SET)
            return resultingKeys.add(key);
          if (value && value.action === ACTIONS.DELETE)
            return resultingKeys.delete(key);
        });

        return Array.from(resultingKeys);
      });
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
   * [mget description]
   * @param  {[type]} ids [description]
   * @return {[type]}     [description]
   */
  mget(ids) {
    const context = {};

    return this._syncCache.mget(ids)
      .then((payload) => {
        const furtherIds = new Set(ids);
        Object.keys(payload).forEach((key) => {
          const wrapper = payload[key];
          if (!wrapper) return;
          furtherIds.delete(key);
          if (wrapper.action === ACTIONS.SET) {
            context[key] = wrapper.value;
          } else {
            context[key] = null;
          }
        });

        return Array.from(furtherIds);
      })
      .then((keys) => super.mget(keys))
      .then((payload) => payload ? Object.assign(payload, context) : context);
  }

  /**
   * [delete description]
   * @param  {[type]} ids [description]
   * @return {[type]}     [description]
   */
  mdelete(ids) {
    return Promise.all(ids.map(id => this.delete(id)));
  }

  /**
   * [sync description]
   * @return {[type]} [description]
   */
  sync() {
    return Promise.resolve()
      // shift down set actions
      .then(() => this._syncCache.getall())
      .then((keys) => this._syncCache.mget(keys))
      .then((payload) => super.mset(payload))
      .then((sucseedKeys) => this._syncCache.mdelete(sucseedKeys))
      // shift down remove ations
      .then(() => this._syncCache.getMarkedForRemoval())
      .then((keys) => super.mdelete(keys))
  }

}

module.exports = SyncOnRequestRepository;
