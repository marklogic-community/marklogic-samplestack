var path = require('path');

var chalk = require('chalk');

var helper = require('../helper');

// make it easier to get to plugins
var $ = helper.$;
var ctx = require('../context');




module.exports = function (opts, cb) {
  var done = false;
  var finalize = function () {
    if (!done) {
      done = true;
      cb();
    }
    // ctx.closeActiveServer(ctx.options.addresses.unitCoverage.port, cb);
  };

  var errFinalize = function (err) {
    if (ctx.currentTask === 'unit') {
      if (!done) {
        done = true;
        cb(err);
      }
    }
  };

  ctx.startIstanbulServer(
    ctx.paths.browser.unitDir,
    ctx.options.addresses.unitCoverage.port
  );
  var myOpts = opts || {};
  // myOpts.silent = true;
  var stream = $.mochaPhantomjs(myOpts);
  // clear screen
  process.stdout.write('\u001b[2J');
  // set cursor position
  process.stdout.write('\u001b[1;3H' + chalk.blue('\nUnit Tests:'));
  stream.on('error', errFinalize);
  stream.on('end', finalize);
  stream.on('finish', finalize);
  stream.write({ path: ctx.options.addresses.unitRunnerCoverage.href });
  stream.end();
};
