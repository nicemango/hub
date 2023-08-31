'use strict';

const yimoCli = require('..');
const assert = require('assert').strict;

assert.strictEqual(yimoCli(), 'Hello from yimoCli');
console.info('yimoCli tests passed');
