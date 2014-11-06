var convert = require('cucumber-junit/lib/cucumber_junit');
var path = require('path');
var childProcess = require('child_process');
var fs = require('fs');

var Runner = require('protractor/lib/runner');
var chalk = require('chalk');

var ctx = require('../context');

var helper = require('../helper');
var $ = helper.$;

var winExt = /^win/.test(process.platform) ? '.cmd' : '';
var async = require('async');

// var seleniumParts = ctx.options.addresses.seleniumServer.match(
//   /([^:]*):\/\/([^:]*):(.*)[\/]?$/
// );
// var seleniumProtocol = seleniumParts[1];
// var seleniumHost = seleniumParts[2];
// var seleniumPort = seleniumParts[3];
var selServer = ctx.options.addresses.seleniumServer;
var seleniumUrl = selServer.href;
var seleniumProtocol = selServer.protocol;
var seleniumHost = selServer.host;
var seleniumPort = selServer.port;

var seleniumVersion;
var seleniumJar;
var seleniumServer;
var seleniumUrl;
var wd;

var myTasks = [];
var _ = require('lodash');


var usage = 'USAGE: `gulp e2e --<pform>`` where <pform> in [java|node]';
var args = {
  reporter: 'pretty',
  // sauce: false,
  toFile: false,
  middleTier: 'external', // or 'java' or 'node',
  sauceBrowser: undefined,
  browser: 'phantomjs', // or 'chrome' or 'firefox' or 'internet explorer'
  os: undefined
};


_.merge(args, require('yargs').argv);


var toFilePrep = function (folderName, reporter) {
  var toFilePath;

  if (folderName) {
    toFilePath =  path.resolve(
      ctx.paths.reportsDir,
      'e2e/',
      args.middleTier,
      folderName
    );
    switch (reporter) {
      case 'xunit':
        toFilePath += '.xml';
        break;
      case 'json':
        toFilePath += '.json';
        break;
      default:
        toFilePath += '.log';
        break;
    }
  }
  else {
    toFilePath = path.resolve(
      ctx.paths.reportsDir, args.toFile
    );
  }

  require('mkdirp').sync(path.dirname(toFilePath));

  return toFilePath;
};

var seleniumPresent = function (cb) {
  var onPresent = function () {
    var ptorDir = path.join(ctx.paths.rootDir, 'node_modules/protractor');
    var protractorPkg = require(path.join(ptorDir, 'package.json'));
    seleniumVersion = protractorPkg.webdriverVersions.selenium;
    var jarFile = 'selenium-server-standalone-' + seleniumVersion + '.jar';
    seleniumJar = path.join(ptorDir, 'selenium', jarFile);
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

    seleniumServer = new SeleniumServer(seleniumJar, {
      // args: 'D'-Dwebdriver.chrome.driver="D:\dev\chromedriver.exe"
      port: seleniumPort,
      args: args
    });
    cb();
  };

  var wdManager = path.join(
    ctx.paths.rootDir,
    'node_modules/protractor/bin/webdriver-manager' + winExt
  );

  childProcess.spawn(
    wdManager,
    ['update'],
    {
      stdio: 'inherit'
    }
  )
      .once('close', onPresent);
};

var seleniumLocalStart = function (cb) {
  seleniumServer.start({
    stdio: 'inherit'
  }).then(
    function started (url) {
      seleniumUrl = url;
      // console.log('selenium server listening at ' + url);
      process.on('exit', seleniumServer.kill);
      cb();
    },
    function failed (reason) {
      throw new Error(reason);
    }
  );
};

var selServerStop = function (cb) {
  if (!seleniumServer) {
    cb();
  }

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
};

var sauceConnectLauncher = require('sauce-connect-launcher');
var sauceProcess;

var seleniumStart = function (cb) {
  if (args.selenium === 'external') {
    $.util.log('using external Selenium server');
    return cb();
  }
  if (args.sauceBrowser) {
    sauceConnectLauncher({
      username: 'stu-salsbury',
      accessKey: '094e6e3e-d1a8-4db9-a222-462d5b5b685c'
    }, function (err, sauceConnectProcess) {
      sauceProcess = sauceConnectProcess;
      if (err) {
        console.error(err.message);
        return;
      }
      process.stdout.write('\n');
      $.util.log('Sauce Connect ready');

      process.on('exit', function () {
        sauceConnectProcess.close();
      });

      cb();
    });
  }
  else {
    async.series([
      seleniumPresent,
      seleniumLocalStart
    ], cb);
  }
};

var ptorConfig = {
  stackTrace: false,
  getPageTimeout: 20000,
  allScriptsTimeout: 40000,
  baseUrl: ctx.options.envs.e2e.addresses.webApp.href,
  rootElement: 'html',
  chromeOnly: false,
  framework: 'cucumber',
  specs: require('globule').find(
    path.resolve(ctx.paths.projectRoot, 'specs/features/**.feature')
  ),

  cucumberOpts: {
    require: path.join(ctx.paths.rootDir, 'test/cucumber-support/**/*.js'),
    // tags: '@dev', use to subset the tests -- tbd how to incporporate into
    // the process https://github.com/angular/protractor/pull/546

    // to get to xunit we generate json and then reformat after the fact
    format: args.reporter !== 'xunit' ? args.reporter : 'json'
  },

  capabilities: {
    'phantomjs.binary.path': require('phantomjs').path,
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG'],
  },

  // doesn't work with sauce
  // multiCapabilities: _.values(ctx.options.sauceBrowsers)
};

if (args.sauceBrowser) {
  _.merge(ptorConfig, {
    sauceUser: 'stu-salsbury',
    sauceKey: '094e6e3e-d1a8-4db9-a222-462d5b5b685c',
    sauceSeleniumAddress: 'localhost:4445/wd/hub',
    capabilities: ctx.options.sauceBrowsers[args.sauceBrowser]
  });
}
else {
  ptorConfig.capabilities.browserName = args.browser;
  delete ptorConfig.capabilities.version;
  delete ptorConfig.capabilities.platform;
}

// _.merge(
//   ptorConfig.capabilities,
//   ctx.options.sauceBrowsers['linux-firefox-32']
// );


var middleTierSetup = function (platform, cb) {
  require('../middle-tier').setup(platform, cb);
};


// courtesy https://gist.github.com/pguillory/729616
var util = require('util');

var oldWrite;
var hookStdOut = function (callback) {
  oldWrite = process.stdout.write;

  process.stdout.write = (function (write) {
    return function (string, encoding, fd) {
      write.apply(process.stdout, arguments);
      callback(string, encoding, fd);
    };
  })(process.stdout.write);

  return function () {
    process.stdout.write = oldWrite;
  };
};

myTasks.push({
  name: 'selenium-start',
  func: function (cb) {
    ctx.seleniumStarted = false;
    seleniumStart (function () {
      ctx.seleniumStarted = true;
      cb();
    });
  }
});

var serverProcess;
myTasks.push({
  name: 'middle-tier',
  func: function (cb) {
    middleTierSetup(args.middleTier, function (err, middleTierProcess) {
      if (err) {
        return cb(err);
      }
      return cb(err);
    });
  }
});

var quitEverything = function () {
  if (serverProcess) {
    try { serverProcess.kill(); } catch (err) {}
  }
  try { ctx.closeActiveServers(); } catch (err) {}
  try { seleniumServer.kill(); } catch (err) {}
  try { sauceProcess.close(); } catch (err) {}
  // console.log('I tried');
};

var testOne = function (browserName, fullConfig, metadata, cb) {
  // console.log('selurl ' + seleniumUrl);
  var runner = new Runner(fullConfig);

  var writeStream;
  var stdOutUnhook;

  $.util.log('begin ' + chalk.magenta(browserName));

  var toFilePath;
  if (args.toFile) {

    toFilePath = toFilePrep(browserName, args.reporter);
    console.log(toFilePath);
    writeStream = fs.createWriteStream(
      toFilePath, {flags: 'w'}
    );
    stdOutUnhook = hookStdOut(function (string, encoding, fd) {
      var matches = string.match(/SauceLabs results available at (.*)/);

      if (matches) {
        try {
          metadata[browserName] = matches[1];
        }
        catch (err) {
          return cb(err);
        }
      }
      else {
        if (
          string.indexOf('Using SauceLabs selenium') < 0
        ) {
          writeStream.write(chalk.stripColor(string), 'utf8');
        }
      }
    });
  }
  try {
    runner.run().then(
      function complete (exitCode) {
        if (toFilePath) {
          stdOutUnhook();
          writeStream.end();
          if (args.reporter === 'xunit') {
            try {
              var converted = convert(
                fs.readFileSync(toFilePath, { encoding: 'utf8' })
              );
              fs.writeFileSync(toFilePath, converted);
            }
            catch (err) {
              $.util.log(chalk.red('could not parse JSON for ' + toFilePath));
              try {
                fs.unlinkSync(toFilePath);
              } catch (err) {}
            }
          }
        }
        $.util.log(chalk.green('finished ' + browserName));
        cb();
        // process.exit();
      },
      function failed (exitCode) {
        if (args.toFile) {
          stdOutUnhook();
          writeStream.end();
          // this file won't really be useful. We really need to try to
          // prevent
          // from getting to this juncture in the test runner.
          // TODO: should something different happen?
          fs.unlinkSync(toFilePath);
        }
        $.util.log(chalk.red(
          'for ' + browserName +
          ', protractor runner failed with exit code ' +
          exitCode
        ));
        cb(exitCode);
      }
    );
  }
  catch (err) {
    cb(err);
  }
};


myTasks.push({
  name: 'e2e',
  // deps: ['build', 'selenium-start'],
  deps: ['build', 'selenium-start', 'middle-tier'],
  func: function (cb) {
    $.util.log(chalk.green('starting web server'));
    ctx.startServer(
      ctx.paths.buildDir,
      ctx.options.envs.e2e.addresses.webApp.port
    );

    if (!ptorConfig.sauceSeleniumAddress) {
      ptorConfig.seleniumAddress = seleniumUrl;
    }

    var caps = {};
    if (args.sauceBrowser === 'all') {
      caps = ctx.options.sauceBrowsers;
    }
    else {
      if (args.sauceBrowser) {
        caps[args.sauceBrowser] = ctx.options.sauceBrowsers[args.sauceBrowser];
      }
      else {
        caps[args.browser] = {
          'browserName': args.browser
        };
      }
    }

    // console.log(JSON.stringify(caps, false, ' '));
    var todo = [];
    var metadata = {};
    _.each(caps, function (cap, key) {
      var myConfig = _.merge(
        _.cloneDeep(ptorConfig),
        { capabilities: _.cloneDeep(cap) }
      );
      // console.log(key);
      // console.log(JSON.stringify(myConfig, false, ' '));
      var func = testOne.bind(
        undefined,
        key,
        myConfig,
        metadata
      );
      todo.push(func);
    });

    async.series(todo, function (err, result) {
      if (err) {
        $.util.log(chalk.red(
          'protractor runner failed with exit code ' + err
        ));
        quitEverything();
        cb();
      }
      else {
        $.util.log('complete!. metadata:\n');
        process.stdout.write(JSON.stringify(metadata, null, ' '));
        quitEverything();
        cb();

      }

    });


  }
});

module.exports = myTasks;
