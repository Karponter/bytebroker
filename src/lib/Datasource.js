'use strict';

const WRITE_MODE = {
  NO_WRITE: 0,
  WRITE_FIRST: 1,
  WRITE_ALWAYS: 2,
};

class Datasource {
    constructor(options = {}) {
      this.writePriority = options.writePriority || -Infinity;
      this.writeMode = options.writeMode || WRITE_MODE.WRITE_FIRST;
      this.readPriority = options.readPriority || -Infinity;
    }
}

Datasource.WRITE_MODE = WRITE_MODE;

module.exports = Datasource;