'use strict';

const SYNC_STRATEGY = require('./lib/constants/sync-strategy');
const NoSyncRepository = require('./lib/NoSyncRepository');
const SyncOnUpdateRepository = require('./lib/SyncOnUpdateRepository');
const SyncOnRequestRepository = require('./lib/SyncOnRequestRepository');
const SyncOnTimeoutRepository = require('./lib/SyncOnTimeoutRepository');
const datasourceImplementations = require('./lib/datasource');

const repositoryFactoryMethod = (options = {}) => {
  switch (options.syncStrategy) {

    case SYNC_STRATEGY.NO_SYNC:
      return new NoSyncRepository(options);

    case SYNC_STRATEGY.SYNC_ON_REQUEST:
      return new SyncOnRequestRepository(options);

    case SYNC_STRATEGY.SYNC_ON_TIMEOUT:
      return new SyncOnTimeoutRepository(options);

    // case SYNC_STRATEGY.SYNC_ON_BUFFER_FULL:
    //   return new SyncOnBufferFullRepository(options);

    case SYNC_STRATEGY.SYNC_ON_UPDATE:
    default:
      return new SyncOnUpdateRepository(options);

  };
};

module.exports = {
  createRepository: repositoryFactoryMethod,
  datasource: datasourceImplementations,
  syncStrategy: SYNC_STRATEGY,
};
