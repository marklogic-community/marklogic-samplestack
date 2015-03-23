// TODO: get phantomjs e2e working
//
// var selVer = '2.43.1';
// var pconfig = require('protractor/config.json');
//
// if (pconfig.webdriverVersions.selenium !== selVer) {
//   console.log(
//     'Configuring protractor to use Selenium Server version ' +
//     selVer + ' for PhantomJS support...'
//   );
//   pconfig.webdriverVersions.selenium = selVer;
//   require('fs').writeFileSync(
//     'node_modules/protractor/config.json', JSON.stringify(pconfig)
//   );
//   console.log('...done.');
// }

// run bower install in browser dir

var path = require('path');
var del = require('del');
var shelljs = require('shelljs');
var chalk = require('chalk');

console.log(chalk.green('Samplestack: fetching browser run-time dependencies'));
del(
  'browser/bower_components',
  {},
  function (err) {
    if (err) {
      console.log('Unable to clear browser\'s bower_components directory.');
      return process.exit(1);
    }

    shelljs.cd('browser');
    shelljs.exec(
      'node ' + path.normalize('../node_modules/bower/bin/bower') + ' install'
    );
    shelljs.cd('..');

    console.log(chalk.green('Samplestack: cleaning up unused directories'));
    del([
      'browser/dev-tasks',
      'browser/node_modules',
      'browser/npm-debug.log'
    ]);
  }
);
