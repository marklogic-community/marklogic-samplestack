// TODO docs
//
var chalk = require('chalk');
var ctx = require('../context');

var writeRunMenu = function () {
  var ten = '          ';
  var message;

  // TODO: parameterize addresses
  message = '\n\n' + ten +
      '--> ' + chalk.magenta('BUILD server') + ' : ' +
      chalk.bold.blue(ctx.options.addresses.webApp.href) +
      '\n' + ten +
      '--> ' + chalk.magenta('UNIT TESTS') + '   : ' +
      chalk.bold.blue(ctx.options.addresses.unitRunner.href) +
      '\n' + ten +
      '--> ' + chalk.magenta('COVERAGE') + '   : ' +
      chalk.bold.blue(ctx.options.addresses.unitCoverage.href) +
      '\n';
  process.stdout.write(message);
};

module.exports = [{
  name: 'run',
  deps: ['build', 'unit'],
  func: function (cb) {
    var adds = ctx.options.addresses;

    // TODO: these should be started where needed, not by this task
    ctx.startServer(ctx.paths.targets.build, adds.webApp.port);
    ctx.startServer(ctx.paths.targets.unit, adds.unitRunner.port);
    ctx.startIstanbulServer(ctx.paths.targets.unit, adds.unitCoverage.port);

    // cb();
    writeRunMenu();
  }
}];
