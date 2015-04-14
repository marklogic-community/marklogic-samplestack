/* 
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
var rimraf;
var async;

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
  rimraf = require('rimraf');
  console.log(
    chalk.green('Samplestack: fetching browser run-time dependencies')
  );
  rimraf(
    path.resolve(__dirname, '../../..', 'browser/bower_components'),
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
  rimraf = require('rimraf');
  async = require('async');

  var repoRoot = path.resolve(__dirname, '../../..');
  console.log(chalk.green('Samplestack: cleaning up unused directories'));
  async.waterfall([
    rimraf.bind(rimraf, path.join(repoRoot, 'browser/dev-tasks')),
    rimraf.bind(rimraf, path.join(repoRoot, 'browser/node_modules')),
    rimraf.bind(
      rimraf, path.join(repoRoot, 'appserver/node-express/node_modules')
    ),
    rimraf.bind(rimraf, path.join(repoRoot, 'browser/npm-debug.log')),
    rimraf.bind(
      rimraf, path.join(repoRoot, 'appserver/node-express/npm-debug.log')
    )
  ], function (err) {
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
