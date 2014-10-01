var path = require('path');

var chalk = require('chalk');

var helper = require('../helper');

// make it easier to get to plugins
var $ = helper.$;
var ctx = require('../context');




module.exports = function (opts, cb) {
  ctx.startIstanbulServer(
    ctx.paths.targets.unit,
    ctx.options.addresses.unitCoverage.port
  );
  var myOpts = opts || {};
  myOpts.silent = true;
  var stream = $.mochaPhantomjs(myOpts);
  // clear screen
  process.stdout.write('\u001b[2J');
  // set cursor position
  process.stdout.write('\u001b[1;3H' + chalk.blue('\nUnit Tests:'));
  stream.on('error', cb);
  stream.on('end', cb);
  stream.write({ path: ctx.options.addresses.unitRunnerCoverage.href });
  stream.end();
};
