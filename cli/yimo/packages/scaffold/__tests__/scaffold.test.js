'use strict';

const scaffold = require('..');
const assert = require('assert').strict;

assert.strictEqual(scaffold(), 'Hello from scaffold');
console.info('scaffold tests passed');
