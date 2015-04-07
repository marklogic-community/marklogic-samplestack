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
