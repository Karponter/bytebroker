'use strict';

const ireq = require('./ireq');
const SYNC_STRATEGY = ireq.lib.constants('./sync-strategy');
const { SyncOnUpdateRepository, NoSyncReposytory } = ireq.lib('');
const datasourceImplementations = ireq.lib.datasource('');

const repositoryFactoryMethod = (options = {}) => {
  switch (options.syncStrategy) {

    case SYNC_STRATEGY.NO_SYNC:
      return new NoSyncReposytory(options);

    case SYNC_STRATEGY.SYNC_ON_REQUEST:
      return new SyncOnRequestReposytory(options);

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
