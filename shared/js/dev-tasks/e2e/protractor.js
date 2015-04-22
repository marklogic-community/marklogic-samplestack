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
var fs = require('fs');
var cp = require('child_process');

var _ = require('lodash');
var chalk = require('chalk');
var Runner = require('protractor/lib/runner');

var ctx = require('../context');


var ptorConfig = {
  stackTrace: false,
  getPageTimeout: 180000,
  allScriptsTimeout: 180000,
  baseUrl: ctx.options.envs.e2e.addresses.webApp.href,
  rootElement: 'html',
  chromeOnly: false,
  framework: 'cucumber',
  maxSessions: 3,
  specs: require('globule').find(
    path.resolve(ctx.paths.projectRoot, 'specs/features/**/*.feature')
  ),

  cucumberOpts: {
    require: path.join(
      ctx.paths.browser.rootDir, 'test/cucumber-support/**/*.js'
    ),
    // tags: '@dev', use to subset the tests -- tbd how to incporporate into
    // the process https://github.com/angular/protractor/pull/546

    // to get to xunit we generate json and then reformat after the fact
    // format: args.reporter !== 'xunit' ? args.reporter : 'json'
  },

  capabilities: {
    'phantomjs.binary.path': require('phantomjs').path,
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG'],
    'webdriver.ie.driver': 'IEDriverServer.exe'
  }
};


var go = function (args, cb) {
  if (args.browser === 'ie') {
    var sjs = require('shelljs');
    sjs.exec(
      'node ' +
          path.normalize(' node_modules/protractor/bin/webdriver-manager') +
          ' update --ie'
    );
    process.env.path += ';' +
        path.resolve(ctx.paths.projectRoot, 'node_modules/protractor/selenium');
  }

  // sauce/IE doens't like "localhost", so we punt.
  // running on Sauce now requires this hosts file entry
  if (args.sauce) {
    ptorConfig.baseUrl =
    ptorConfig.baseUrl.replace('localhost', 'samplestack.local');
  }

  if (args.tags) {
    ptorConfig.cucumberOpts.tags = [args.tags];
  }
  if (args.sauce) {
    var multiCapabilities;
    if (args.sauce === true || args.sauce === 'supported') {
      multiCapabilities = _.values(
        _.pick(ctx.options.sauceBrowsers, function (cap, key) {
          return ctx.options.supportedBrowsers.indexOf(key) >= 0;
        })
      );
    }
    else {
      if (args.sauce === 'all') {
        multiCapabilities = _.values(ctx.options.sauceBrowsers);
      }
      else {
        multiCapabilities = [ctx.options.sauceBrowsers[args.sauce]];
      }
    }
    _.each(multiCapabilities, function (cap) {
      cap['idle-timeout'] = 360;
    });
    _.merge(ptorConfig, {
      sauceUser: ctx.options.sauceCredentials.user,
      sauceKey: ctx.options.sauceCredentials.accessKey,
      sauceSeleniumAddress: ctx.getActiveServer('selenium').url.href,
      multiCapabilities: multiCapabilities
    });
    ptorConfig.capabilities = {};
  }
  else {
    var browsers = {
      'ie': 'internet explorer',
      'chrome': 'chrome',
      'ff': 'firefox',
      'firefox': 'firefox',
      'phantomjs': 'phantomjs',
    };
    ptorConfig.capabilities.browserName = browsers[args.browser];
    ptorConfig.seleniumAddress = ctx.getActiveServer('selenium').url.href;
  }
  if (args.reporter === 'xunit') {
    ptorConfig.cucumberOpts.format = 'json';
  }
  else {
    ptorConfig.cucumberOpts.format = args.reporter;
  }

  var ptorString = JSON.stringify(ptorConfig, null, ' ');
  ptorString = 'exports.config = ' + ptorString + ';\n';
  var confPath = path.join(__dirname, 'protractor.conf');
  fs.writeFileSync(confPath, ptorString);


  var ptorPath = path.resolve(
    ctx.paths.projectRoot, 'node_modules/protractor/bin/protractor'
  );

  var ptorProc = cp.spawn('node', [ptorPath, confPath], { stdio: 'inherit' });
  ptorProc.on('exit', function (code) {
    cb(code);
  });

  // var cucumberParser = require('./cucumberParser');
  // cucumberParser.handle(args, ptorConfig, ptorProc, cb);
};

module.exports = {
  go: go
};
