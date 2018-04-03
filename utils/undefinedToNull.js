'use strict';

const undefinedToNull = (value) => 
    value === undefined ? null : value;

module.exports = undefinedToNull;