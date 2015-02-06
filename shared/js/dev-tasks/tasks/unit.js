// TODO docs
//
var runUnit = require('../unit/runUnit');
var ctx = require('../context');
var helper = require('../helper');
var $ = helper.$;
var chalk = require('chalk');

var mochaReporter = 'dot';

// We don't want express complaining about deprecated APIs when it's not
// our code that's using them.
// TODO: this seems like a strange place to set this.
process.env['NO_DEPRECATION'] = 'express';

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
      runUnit({ reporter: mochaReporter }, function (err) {
        if (ctx.currentTask === 'unit') {
          ctx.closeActiveServers(function () { cb(err); });
        }
        else {
          ctx.deployBuilt(function (err) {
            if (err) {
              return cb(err);
            }
            if (!ctx.watchTaskCalled) {
              ctx.closeActiveServers(cb);
            }
            else {
              cb();
            }
          });
        }
      });
    }
  }
}];
