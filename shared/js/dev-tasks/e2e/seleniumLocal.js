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

var childProcess = require('child_process');
var path = require('path');

var ctx = require('../context');

var getLastJar = function (dir) {
  var g = require('globule');

  var paths = g.find(path.join(dir, '*.jar'));
  if (paths.count < 1) {
    throw new Error('cannot find Selenium .jar file in ' + dir);
  }
  return paths.sort()[paths.length - 1];
};


var server;

// set up server object, if necessary downloading the jar to do so
// set serverUrl once configured
// read PORT from ctx.options.addresses.seleniumServer, ignore other parts
// of that url
var getServer = function (cb) {
  try {

    var selServer = ctx.options.addresses.seleniumServer;
    var seleniumPort = selServer.port;

    var seleniumVersion;
    var seleniumJar;
    var seleniumUrl;
    var wd;

    var onPresent = function () {
      var ptorDir = path.join(ctx.paths.projectRoot, 'node_modules/protractor');
      var seleniumJar = getLastJar(path.join(ptorDir, 'selenium'));
      var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

      var args = [];
      var chromeArg = '-Dwebdriver.chrome.driver=' +
        path.join(
          ctx.paths.projectRoot,
          'node_modules/protractor/selenium/chromedriver'
        );
      var phantomArg = '-Dphantomjs.binary.path=' +
        path.join(
          ctx.paths.projectRoot,
          'node_modules/phantomjs/bin/phantomjs'
        );

      args.push(chromeArg);
      args.push(phantomArg);

      server = new SeleniumServer(seleniumJar, {
        port: seleniumPort,
        args: args
      });
      cb(null);

    };

    var wdManager = path.join(
      ctx.paths.projectRoot,
      'node_modules/protractor/bin/webdriver-manager'
    );

    var proc = childProcess.spawn(
      'node',
      [wdManager, 'update'],
      {
        stdio: 'inherit'
      }
    );
    proc.on('error', cb);
    proc.once('close', onPresent);
  }
  catch (err) {
    cb(err);
  }
};

var close;
var start = function (args, cb) {
  ctx.seleniumStarted = false;
  getServer(function (err) {
    if (err) {
      return cb(err);
    }

    server.start({
      stdio: 'inherit'
    });

    var url = server.address();
    ctx.seleniumStarted = true;
    ctx.setActiveServer('selenium', {
      url: url,
      close: function (cb) {
        cb();
        server.kill();
      }
    });
    cb();
  });
};

module.exports = {
  start: start
};
