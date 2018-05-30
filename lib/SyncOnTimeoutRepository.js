'use strict';

const SyncOnRequestRepository = ireq.lib('./SyncOnRequestRepository');

class SyncOnTimeoutRepository extends SyncOnRequestRepository {

  /**
   * SyncOnUpdateRepository instance constructor
   * @param  {Array}    options.datasource
   *         -- stack of datasources to write and read data
   * @param  {Function} options.entityFactory
   *         -- output entity factory, a pipe for eny gatter operation
   * @param  {Number}   options.syncStrategy
   *         -- constant that defines stratagy of communication with datasources
   * @param  {Number}   options.interval
   *         -- datasource sync interval
   */
  constructor(options = {}) {
    super(options);
    this.syncInterval = null;

    if (options.interval) {
      this.syncInterval = setInterval(() => this.sync(), options.interval);
    }
  }

}
