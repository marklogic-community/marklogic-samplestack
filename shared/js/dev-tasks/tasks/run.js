// TODO docs
//
var chalk = require('chalk');
var ctx = require('../context');

var writeRunMenu = function () {
  var ten = '          '; // ten spaces
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
    ctx.startServer(ctx.paths.browser.buildDir, adds.webApp.port);
    ctx.startServer(ctx.paths.browser.unitDir, adds.unitRunner.port);
    ctx.startIstanbulServer(
      ctx.paths.browser.unitDir, adds.unitCoverage.port
    );

    writeRunMenu();

    // never call cb() means we run till killed
  }
}];
