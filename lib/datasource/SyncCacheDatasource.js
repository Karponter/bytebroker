'use strict';

const ireq = require('ireq');

const { InMemoryDatasource } = ireq.lib.datasource('');

const ACTIONS = {
  SET: 'set',
  DELETE: 'delete',
};

const wrapCacheSetter = value => ({ action: ACTIONS.SET, value });
const unwrapCacheValue = (wrappedValue) => {
  if (wrappedValue && wrappedValue.action === ACTIONS.SET) {
    return wrappedValue.value;
  }

  return null;
};

class SyncCacheDatasource extends InMemoryDatasource {

  /**
   * [set description]
   * @param {[type]} id    [description]
   * @param {[type]} value [description]
   */
  set(id, value) {
    const wrappedValue = wrapCacheSetter(value);
    return super.set(id, wrappedValue);
  }

  /**
   * [get description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  get(id) {
    return super.get(id)
      .then(unwrapCacheValue);
  }

  /**
   * [mget description]
   * @param  {[type]} ids [description]
   * @return {[type]}     [description]
   */
  mget(ids) {
    return super.mget(ids)
      .then((payload) => {
        const unwrapped = {};
        Object.keys(payload).forEach((key) => {
          unwrapped[key] = unwrapCacheValue(payload[key]);
        });

        return unwrapped;
      });
  }

  /**
   * [markAsRemoved description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  markAsRemoved(id) {
    return super.set(id, { action: ACTIONS.DELETE });
  }

  /**
   * [expose description]
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  expose(id) {
    return super.get(id);
  }

}

module.exports = SyncCacheDatasource;
