'use strict';

const path = require('path');
const findFileOnPath = require('./find-file-on-path');

function getAppDelegatePath(options = { cwd: '.' }) {
  return findFileOnPath('AppDelegate.mm', path.resolve(options.cwd, 'ios'));
}

module.exports = getAppDelegatePath;
