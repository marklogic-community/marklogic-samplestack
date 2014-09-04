// TODO docs
//
var runUnit = require('../unit/runUnit');
var ctx = require('../context');
var helper = require('../helper');
var $ = helper.$;
var chalk = require('chalk');

var mochaReporter = 'dot';

module.exports = [{
  name: 'unit',
  deps: ['build'],
  func: function (cb) {
    if (ctx.hadErrors || ctx.rebuildOnNext) {
      $.util.log(chalk.yellow('skipping unit tests due to build errors'));
      cb();
    }
    else {
      // TODO: read alternative reporter(s) from minimist in order to support
      // test harness automation
      runUnit({ reporter: mochaReporter }, function () {
        if (!ctx.watchTaskCalled) {
          ctx.closeActiveServers();
        }
        cb();
      });
    }
  }
}];
