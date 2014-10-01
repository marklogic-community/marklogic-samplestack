var path = require('path');
var childProcess = require('child_process');

var ctx = require('../context');
var helper = require('../helper');

var winExt = /^win/.test(process.platform) ? '.cmd' : '';

// var seleniumParts = ctx.options.addresses.seleniumServer.match(
//   /([^:]*):\/\/([^:]*):(.*)[\/]?$/
// );
// var seleniumProtocol = seleniumParts[1];
// var seleniumHost = seleniumParts[2];
// var seleniumPort = seleniumParts[3];
var seleniumUrl = ctx.options.addresses.seleniumServer;
var seleniumProtocol = seleniumUrl.protocol;
var seleniumHost = seleniumUrl.host;
var seleniumPort = seleniumUrl.port;

var seleniumVersion;
var seleniumJar;
var seleniumServer;
var seleniumUrl;
var wd;

var myTasks = [];

myTasks.push({
  name: 'selenium-present',
  deps: [],
  func: function (cb) {

    var onPresent = function () {
      var ptorDir = path.join(__dirname, '../node_modules/protractor');
      var protractorPkg = require(path.join(ptorDir, 'package.json'));
      seleniumVersion = protractorPkg.webdriverVersions.selenium;
      var jarFile = 'selenium-server-standalone-' + seleniumVersion + '.jar';
      seleniumJar = path.join(ptorDir, 'selenium', jarFile);
      var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

      var args = [];
      var chromeArg = '-Dwebdriver.chrome.driver=' +
        path.join(
          __dirname,
          '../node_modules/protractor/selenium/chromedriver'
        );
      var phantomArg = '-Dphantomjs.binary.path=' +
        path.join(
          __dirname,
          '../node_modules/phantomjs/bin/phantomjs'
        );

      args.push(chromeArg);
      args.push(phantomArg);

      seleniumServer = new SeleniumServer(seleniumJar, {
        // args: 'D'-Dwebdriver.chrome.driver="D:\dev\chromedriver.exe"
        port: seleniumPort,
        args: args
      });
      cb();
    };

    childProcess.spawn(
      path.join(
        __dirname,
        '../node_modules/protractor/bin/webdriver-manager' + winExt
      ),
      ['update'],
      {
        stdio: 'inherit'
      }
    )
        .once('close', onPresent);
  }
});

myTasks.push({
  name: 'selenium-start',
  deps: ['selenium-present'],
  func: function (cb) {


    seleniumServer.start({
      stdio: 'inherit'
    }).then(
      function started (url) {
        seleniumUrl = url;
        // console.log('selenium server listening at ' + url);
        cb();
      },
      function failed (reason) {
        throw new Error(reason);
      }
    );
  }
});

myTasks.push({
  name: 'selenium-stop',
  deps: ['selenium-present'],
  func: function (cb) {
    seleniumServer.stop().then(
      function stopped () {
        console.log('stopped selenium');
        seleniumServer = null;
        cb();
      },
      function cantStop (reason) {
        throw new Error(reason);
      }
    );

  }
});

var ptorConfig = {
  stackTrace: false,
  allScriptsTimeout: 5000,
  baseUrl: ctx.options.envs.e2e.appServer,
  rootElement: 'html',
  chromeOnly: false,
  framework: 'cucumber',
  specs: [
    path.join(__dirname, '../../specs/features')
  ],
  params: {
    login: {
      user: 'Jane',
      password: '1234'
    }
  },
  cucumberOpts: {
    require: path.join(__dirname, '../test/cucumber-support/**/*.js'),
    // tags: '@dev', use to subset the tests -- tbd how to incporporate into
    // the process https://github.com/angular/protractor/pull/546
    format: 'pretty'
  },

  capabilities: {

    browserName: 'chrome',
    // 'phantomjs.binary.path': path.join(
    //   __dirname, '../node_modules/phantomjs/bin/phantomjs'
    // ),
    // 'phantomjs.cli.args': ['--logfile=PATH', '--loglevel=DEBUG'],

    // 'browserName': 'chrome'
    // 'browserName': 'firefox'
  }
};

myTasks.push({
  name: 'e2e',
  deps: ['build', 'selenium-start'],
  func: function (cb) {
    ctx.startServer(
      helper.targets.build,
      ctx.options.util.portFromAddress(ctx.options.envs.e2e.webApp)
    );

    ptorConfig.seleniumAddress = seleniumUrl;
    var Runner = require('protractor/lib/runner');
    var runner = new Runner(ptorConfig);
    runner.run().then(
      function complete (exitCode) {
        ctx.closeActiveServers();
        cb();
      },
      function failed (exitCode) {
        console.log('protractor runner failed with exit code ' + exitCode);
        ctx.closeActiveServers();
        cb();
      }
    );

  }
});

module.exports = myTasks;
