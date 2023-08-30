'use strict';

const codeAnalysis = require('..');
const assert = require('assert').strict;

assert.strictEqual(codeAnalysis(), 'Hello from codeAnalysis');
console.info('codeAnalysis tests passed');
