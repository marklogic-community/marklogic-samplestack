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
