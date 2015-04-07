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
var runUnit = require('../unit/runUnit');
var ctx = require('../context');
var helper = require('../helper');
var $ = helper.$;
var chalk = require('chalk');

var mochaReporter = 'dot';

// We don't want express complaining about deprecated APIs when it's not
// our code that's using them.
// TODO: this seems like a strange place to set this.
process.env['NO_DEPRECATION'] = 'express';

module.exports = [{
  name: 'unit',
  deps: ['build'],
  func: function (cb) {
    if (ctx.hadErrors || ctx.rebuildOnNext) {
      $.util.log(chalk.yellow('skipping unit tests due to build errors'));
      cb();
    }
    else {
      // TODO: read alternative reporter(s) from minimist in order to support
      // test harness automation
      runUnit({ reporter: mochaReporter }, function (err) {
        if (ctx.currentTask === 'unit') {
          ctx.closeActiveServers(function () { cb(err); });
        }
        else {
          ctx.deployBuilt(function (err) {
            if (err) {
              return cb(err);
            }
            if (!ctx.watchTaskCalled) {
              ctx.closeActiveServers(cb);
            }
            else {
              cb();
            }
          });
        }
      });
    }
  }
}];
