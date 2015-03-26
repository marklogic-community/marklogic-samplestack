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
var cp = require('child_process');

// first run an install of npm, specifying no optional deps
// then install bower components
// then clean up files which may remain from earlier Samplestack versions

// don't try to use these until a successful install has happened
var chalk;
var del;

var rootDir = path.resolve(__dirname, '../../..');

// // run npm install in the root dir, specifyin no optional deps
// // exit on fail, otherwise call back
// var doInst = function (cb) {
//   var instProc = cp.spawn(
//     'npm',
//     ['install', '--no-optional'],
//     { stdio: 'inherit', cwd: rootDir }
//   );
//   instProc.on('exit', function (err) {
//     if (err) {
//       return process.exit(err);
//     }
//     cb();
//   });
// };

// clean up bower_components, run bower install from browser dir
// exit on fail, otherwise call back
var doBower = function (cb) {
  chalk = require('chalk');
  del = require('del');
  console.log(
    chalk.green('Samplestack: fetching browser run-time dependencies')
  );
  del(
    'browser/bower_components',
    { cwd: rootDir },
    function (err) {
      if (err) {
        console.log('Unable to clear browser\'s bower_components directory.');
        return process.exit(err);
      }
      var bowerProc = cp.spawn(
        'node',
        [path.resolve(rootDir, 'node_modules/bower/bin/bower'), 'install'],
        { stdio: 'inherit', cwd: path.join( rootDir, 'browser') }
      );

      bowerProc.on('exit', function (err) {
        if (err) {
          return process.exit(err);
        }
        cb();
      });
    }
  );
};

// clean up old directories, exit on fail, otherwise optionally call back
var doCleanup = function (cb) {
  chalk = require('chalk');
  del = require('del');
  console.log(chalk.green('Samplestack: cleaning up unused directories'));
  del(
    [
      'browser/dev-tasks',
      'browser/node_modules',
      'appserver/node-express/node_modules',
      'browser/npm-debug.log',
      'appserver/node-express/npm-debug.log'
    ],
    { cwd: rootDir },
    function (err) {
      if (err) {
        return process.exit(err);
      }
      if (cb) {
        cb();
      }
    }
  );
};

doBower(doCleanup);
