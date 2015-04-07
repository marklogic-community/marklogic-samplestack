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

var url = require('url');

var sauceConnectLauncher = require('sauce-connect-launcher');
var helper = require('../helper');
var $ = helper.$;

var ctx = require('../context');
var sauceProcess;

var sauceStart = function (args, cb) {
  ctx.seleniumStarted = false;

  if (
    !ctx.options.sauceCredentials.user ||
        !ctx.options.sauceCredentials.accessKey
  ) {
    return cb(new Error('Missing SauceLabs credentials'));
  }

  sauceConnectLauncher({
    username: ctx.options.sauceCredentials.user,
    accessKey: ctx.options.sauceCredentials.accessKey,
    verbose: true
  }, function (err, sauceConnectProcess) {
    if (err) { return cb(new Error(err)); }
    sauceProcess = sauceConnectProcess;
    process.stdout.write('\n');

    ctx.setActiveServer('selenium', {
      url: url.parse('localhost:4445/wd/hub'),
      close: function (cb) {
        process.stdout.write('shutting down Sauce Connect\n');
        sauceProcess.on('exit', function () {
          cb();
        });
        sauceProcess.kill();
      }
    });

    $.util.log('Sauce Connect ready');
    ctx.seleniumStarted = true;
    cb();
  });
};

module.exports = {
  start: sauceStart
};
