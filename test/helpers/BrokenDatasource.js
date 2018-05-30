'use setrict';

const Datasource = require('../../lib/Datasource');

class BrokenDatasource extends Datasource {

  constructor(_, options) {
    super(options);
  }

  get() {
    return Promise.reject(new Error());
  }

  set() {
    return Promise.reject(new Error());
  }

  delete() {
    return Promise.reject(new Error());
  }

  mget() {
    return Promise.reject(new Error());
  }

  mset() {
    return Promise.reject(new Error());
  }

  mdelete() {
    return Promise.reject(new Error());
  }

  getall() {
    return Promise.reject(new Error());
  }

  find() {
    return Promise.reject(new Error());
  }

}

module.exports = BrokenDatasource;
