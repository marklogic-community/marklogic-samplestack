// TODO docs
//
var chalk = require('chalk');
var ctx = require('../context');

var writeRunMenu = function () {
  var ten = '          ';
  var message;

  // TODO: parameterize addresses
  message = '\n\n' + ten +
      // '--> ' + chalk.magenta('BUILD server') + ' : ' +
      // chalk.bold.blue('http://localhost:8090') +
      // '\n' + ten +
      '--> ' + chalk.magenta('UNIT TESTS') + '   : ' +
      chalk.bold.blue('NOT YET IMPLEMENTED!!! http://localhost:8091/unit-runner.html') +
      '\n' + ten +
      '--> ' + chalk.magenta('COVERAGE') + '   : ' +
      chalk.bold.blue('NOT YET IMPLEMENTED!!! http://localhost:8094/coverage') +
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

    ctx.restartServer();
    writeRunMenu();
    cb();
  }
}];
