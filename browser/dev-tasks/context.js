// TODO: docs
//
// TODO in general, we should think about using a port-finding technique
// in case ports are occupied, and/or give clear messages in those cases
// so that the developer can reconfigure

var path = require('path');
var childProcess = require('child_process');

var gulp = require('gulp');

var chalk = require('chalk');
var minimist = require('minimist');
var helper = require('./helper');
var buildParams = require('../buildParams');

// make it easier to get to plugins
var $ = helper.$;

var amWatching = false;
var activeServers;
var rebuildOnNext = false;
var watchTaskCalled = false;
var hadErrors = false;

var rootDir = path.resolve(__dirname, '..');
var targets =  {
  build: 'builds/built',
  unit: 'builds/unit-tester',
  dist: 'builds/dist'
};

var self;
var gulpChild;

process.on('SIGINT', function () {
  if (self.isChildProcess()) {
    // as a child process, this is a real worker, so close the servers and
    // get out
    self.closeActiveServers();
    setTimeout(function () {
      process.exit(0);
    }, 10);
  }
  else {
    console.log('\n\nExiting...');
    // as the parent process, a SIGINT means close both the child and the self
    if (gulpChild) {
      gulpChild.kill('SIGINT');
    }
    process.exit(0);
  }
});

self = module.exports = {
  errorHandler: function (err) {
    // console.log('errorHandler');
    self.hadErrors = true;
    $.util.log(
      $.util.colors.red('Error:\n\n') + err.toString().trim() + '\n'
    );
    if (self.watchTaskCalled && !self.rebuildOnNext) {
      $.util.log('[' + chalk.cyan('watch') + '] ' +
          chalk.yellow(
            'a full rebuild will be scheduled on next change'
          ));
      self.rebuildOnNext = true;
    }
  },

  buildParams: buildParams,

  paths:  {
    rootDir: rootDir,
    targets: targets,

    src: 'src',
    unit: 'test/unit-tests',
    builds: 'builds',
    buildsRoot: path.join(rootDir, 'builds'),
    buildDir: path.join(rootDir, targets.build),
    unitDir: path.join(rootDir, targets.unit),
    distDir: path.join(rootDir, targets.dist),
    srcDir: path.join(rootDir, 'src'),
    unitSrcDir: path.join(rootDir, 'test/unit-tests'),
    unitPattern: path.join(rootDir, 'unit/**/*'),
    srcPattern: path.join(rootDir, 'src/**/*')
  },

  streamErrorHandler: function (err) {
    hadErrors = true;
    $.util.log(
      $.util.colors.red('[ERROR]:\n\n') +
      err.toString().trim() + '\n'
    );
    if (watchTaskCalled && !rebuildOnNext) {
      $.util.log('[' + chalk.cyan('watch') + '] ' +
          chalk.yellow(
            'a full rebuild will be scheduled on next change'
          ));
      rebuildOnNext = true;
    }
  },

  closeActiveServers: function () {
    var serverKey;
    for (serverKey in activeServers) {
      var server = activeServers[serverKey];
      try {
        server.close();
      } catch (err) {
        console.log('while closing ' + serverKey + ':\n' + err.toString());
      }
      delete activeServers[serverKey];
    }
  },

  setActiveServer: function (key, server) {
    if (!activeServers) {
      activeServers = {};
    }
    activeServers[key.toString()] = server;
  },

  getActiveServer: function (key) {
    return activeServers && activeServers[key.toString()];
  },


  startServer: function (path, port, html5) {
    if (!self.getActiveServer(port)) {
      var connect = require('connect');
      var serveStatic = require('serve-static');
      var request = require('request').defaults({
        timeout: 10000
      });

      var server = connect()
        .use('/v1/', function (req, res) {
          req.pipe(
            request(buildParams.build.restUrl + '/v1/' + req.url)
          )
          .on('error', function (err) {
            console.log(err);
          })
          .pipe(res);
        });

      // TODO: is this conditional reasonable?
      if (html5 && buildParams.appSettings.html5Mode) {
        server.use(
          require('connect-modrewrite')(
          // if lacking a dot, redirect to index.html
            ['!\\. /index.html [L]']
          )
        );
      }

      var listener = server
        .use(serveStatic(path, {redirect: false}))
        .listen(port, '0.0.0.0');

      listener.on('error', function (err) {
        console.log(err);
      });
      self.setActiveServer(port, listener);

      return server;
    }
  },

  startIstanbulServer: function (testerPath, port) {
    if (!self.getActiveServer(port)) {
      var express = require('express');
      var im = require('istanbul-middleware');
      var bodyParser = require('body-parser');
      var app = express();
      var url = require('url');

      im.hookLoader(testerPath);
      app.use('/coverage', require('connect-livereload')({
        port: 35730
      }));
      app.use('/coverage', im.createHandler());
      app.use(im.createClientHandler(
        path.resolve(testerPath),
        {
          matcher: function (req) {
            // cover js files that aren't .unit.js and are not ext dependencies
            var parsed = url.parse(req.url).pathname;
            if (!/\.js$/.test(parsed)) {
              return false;
            }
            if (parsed.match(/index\.js/)) {
              // its a modules index file
              return false;
            }
            if (!(parsed.match(/^\/.+\/.+\//))) {
              // it's not deep enough to be the code we really want to test
              return false;
            }
            if (parsed.match(/^\/mocks\//)) {
              // it's part of the mocks modules
              return false;
            }
            var isBrowserify = /\.browserify\.js$/.test(parsed);
            var isTestCode = /\.unit\.js$/.test(parsed);
            // console.log(parsed + ' is test code: ' + isTestCode);
            var isDependency = /^\/deps\//.test(parsed);
            // console.log(parsed + ' is dep. code: ' + isDependency);
            return !(isTestCode || isBrowserify || isDependency);
          }
          // pathTransformer: function (req) {
          // }
        }
      ));
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());

      app.use(express['static'](path.resolve(testerPath)));
      var httpServer = require('http').createServer(app);
      httpServer.listen(port,'0.0.0.0');

      self.setActiveServer(port, httpServer);
    }
  },

  currentTask: function () {
    var argv = minimist(process.argv.slice(2));
    return argv._[0] || 'default';
  },

  isChildProcess: function () {
    var argv = minimist(process.argv.slice(2));
    return argv['as-child'];
  },

  restartChild: function () {
    var argv = minimist(process.argv.slice(2));
    if (gulpChild) {
      gulpChild.kill('SIGINT');
    }

    gulpChild = childProcess.spawn(
      'gulp', argv._.concat('--as-child'), { stdio: 'inherit' }
    );
  }
};
