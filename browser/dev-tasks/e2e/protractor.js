var path = require('path');
var fs = require('fs');
var cp = require('child_process');

var _ = require('lodash');
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
    require: path.join(ctx.paths.rootDir, 'test/cucumber-support/**/*.js'),
    // tags: '@dev', use to subset the tests -- tbd how to incporporate into
    // the process https://github.com/angular/protractor/pull/546

    // to get to xunit we generate json and then reformat after the fact
    // format: args.reporter !== 'xunit' ? args.reporter : 'json'
  },

  capabilities: {
    'phantomjs.binary.path': require('phantomjs').path,
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG'],
  }
};


var go = function (args, cb) {
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
      if (process.env['TRAVIS_JOB_NUMBER']) {
        cap['tunnel-identifier'] = process.env['TRAVIS_JOB_NUMBER'];
      }
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

  if (ptorConfig.multiCapabilities) {
    delete ptorConfig.capabilities;
  }

  var ptorString = JSON.stringify(ptorConfig, null, ' ');
  ptorString = 'exports.config = ' + ptorString + ';\n';
  var confPath = path.join(__dirname, 'protractor.conf');
  fs.writeFileSync(confPath, ptorString);


  var ptorPath = path.resolve(__dirname, '../../node_modules/protractor' +
      '/bin/protractor');

  var ptorProc = cp.spawn('node', [ptorPath, confPath], { stdio: 'inherit' });
  ptorProc.on('exit', function (code) {
    process.exit(code);
  });

  var cucumberParser = require('./cucumberParser');
  cucumberParser.handle(args, ptorConfig, ptorProc, cb);
};

module.exports = {
  go: go
};
