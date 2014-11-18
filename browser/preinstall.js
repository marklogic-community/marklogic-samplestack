var lodashVersion = require('./package.json').devDependencies.lodash
    .replace(/[^\.\d]*/g, '');

var cp = require('child_process')
    .exec('npm install lodash@' + lodashVersion);
