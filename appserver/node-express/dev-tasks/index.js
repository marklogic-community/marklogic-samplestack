// watch
// js hint
// jscs
// mocha
// chai-as-promised
// supertest -- test responses from middle-tier to (some) browser
// https://www.npmjs.org/package/nock  to mock ML server for unit tests
// sinon mock collaborators
// node-monitor / node-dashboard for monitoring
//
var tasks = module.exports = {};
//
var fs = require('fs');
var path = require('path');

var ctx = require('./context');

module.exports = fs.readdirSync(path.join(__dirname, 'tasks')).reduce(
  function (acc, modPath) {
    var modName = path.basename(modPath).replace(/\.js/, '');
    var mod = require('./tasks/' + modName);
    mod.forEach(function (taskObj) {
      acc[taskObj.name] = taskObj;
    });
    return acc;
  },
  {}
);
