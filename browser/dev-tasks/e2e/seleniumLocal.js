var childProcess = require('child_process');
var path = require('path');

var ctx = require('../context');

var winExt = /^win/.test(process.platform) ? '.cmd' : '';


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
      var ptorDir = path.join(ctx.paths.rootDir, 'node_modules/protractor');
      var protractorPkg = require(path.join(ptorDir, 'package.json'));
      var seleniumVersion = protractorPkg.webdriverVersions.selenium;
      var jarFile = 'selenium-server-standalone-' + seleniumVersion + '.jar';
      var seleniumJar = path.join(ptorDir, 'selenium', jarFile);
      var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

      var args = [];
      var chromeArg = '-Dwebdriver.chrome.driver=' +
        path.join(
          ctx.paths.rootDir,
          'node_modules/protractor/selenium/chromedriver'
        );
      var phantomArg = '-Dphantomjs.binary.path=' +
        path.join(
          ctx.paths.rootDir,
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
      ctx.paths.rootDir,
      'node_modules/protractor/bin/webdriver-manager' + winExt
    );

    var proc = childProcess.spawn(
      wdManager,
      ['update'],
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
var start = function (cb) {
  ctx.seleniumStarted = false;
  getServer(function (err) {
    if (err) { return cb(err); }

    server.start({
      stdio: 'inherit'
    }).then(
      function started (url) {
        ctx.seleniumStarted = true;
        ctx.setActiveServer('selenium', {
          url: url.parse(url),
          close: function (cb) {
            server.on('exit', function () {
              cb();
            });
            server.kill();
          }
        });
        cb();
      },
      cb
    );
  });
};

module.exports = {
  start: start
};
