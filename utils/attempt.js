'use strict';

const attempt = (value, action) => {
  if (value !== null) return value;
  return action();
};

module.exports = attempt;
