'use strict';

const { createRepository } = require('../index');

const messages = createRepository();

Promise.resolve()
  .then(() => messages.set('greeting', 'Hello folks!'))
  .then(() => messages.set('bye', 'Have a nice day!'));

const action = () => {
  Promise.resolve()
    .then(() => messages.get('greeting'))
    .then(console.log())
    .then(() => messages.get('bye'))
    .then(console.log());
};

setTimeout(action, 1000);
