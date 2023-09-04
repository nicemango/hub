'use strict';

const yimoTemplate = require('..');
const assert = require('assert').strict;

assert.strictEqual(yimoTemplate(), 'Hello from yimoTemplate');
console.info('yimoTemplate tests passed');
