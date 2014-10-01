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
      chalk.bold.blue(ctx.options.addresses.appServer.href) +
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

    // TODO: these should be started where needed, not by this task
    // startServer(h.targets.build, 3000);
    // startServer(h.targets.unit, 3001);
    // startIstanbulServer(h.targets.unit, 3004);

    cb();
    writeRunMenu();
  }
}];
