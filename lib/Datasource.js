'use strict';

const WRITE_MODE = {
    NO_WRITE: 1,
    WRITE_FIRST: 2,
    WRITE_ALWAYS: 3,
};

class Datasource {
    constructor(options = {}) {
        this.writePriority = options.writePriority || -Infinity;
        this.writeMode = options.writeMode || WRITE_MODE.WRITE_FIRST;
        this.readPriority = options.readPriority || -Infinity;
    }

    find(regexp, flags) {
        if (!(regexp instanceof RegExp)) {
            regexp = new RegExp(regexp, flags);
        }

        return this.getall()
            .then((allKeys) => allKeys.filter((key) => regexp.test(key)));
    }
}

Datasource.WRITE_MODE = WRITE_MODE;

module.exports = Datasource;