

// TODO: docs
//
// TODO in general, we should think about using a port-finding technique
// in case ports are occupied, and/or give clear messages in those cases
// so that the developer can reconfigure

var _ = require('lodash');
var path = require('path');
var childProcess = require('child_process');

var gulp = require('gulp');

var chalk = require('chalk');
// var minimist = require('minimist');
var argv = require('yargs').argv;
var helper = require('./helper');
var options = require('../options');

// make it easier to get to plugins
var $ = helper.$;

var amWatching = false;
var activeServers;
var rebuildOnNext = false;
var watchTaskCalled = false;
var hadErrors = false;

var rootDir = path.resolve(__dirname, '..');
var projectRoot = path.resolve(__dirname, '../..');
var reportsDir = path.resolve(projectRoot, 'reports');

var targets =  {
  build: 'builds/built',
  unit: 'builds/unit-tester',
  dist: 'builds/dist'
};

var self;
var gulpChild;

var closeServer = function (server, cb) {
  try {
    server.close(function () {
      cb();
    });
  }
  catch (err) {
    cb();
  }
};

process.on('SIGINT', function () {
  if (self.isChildProcess()) {
    // as a child process, this is a real worker, so close the servers and
    // get out
    self.closeActiveServers(function () {
      process.exit(0);
    });
  }
  else {
    console.log('\n\nExiting...');
    // as the parent process, a SIGINT means close both the child and the self
    if (gulpChild) {
      // this message will eventually get things cleaned up and then exit
      gulpChild.on('exit', function () {
        process.exit(0);
      });
    }
    else {
      // no chid process means we weren't really doing anything anyway
      process.exit(0);
    }
  }
});

self = module.exports = {
  errorHandler: function (err) {
    console.log(err.stack);
    // console.log('errorHandler');
    self.hadErrors = true;
    $.util.log(
      $.util.colors.red('Error:\n\n') + err.toString().trim() + '\n' +
      err.stack + '\n'
    );
    if (self.watchTaskCalled && !self.rebuildOnNext) {
      $.util.log('[' + chalk.cyan('watch') + '] ' +
          chalk.yellow(
            'a full rebuild will be scheduled on next change'
          ));
      self.rebuildOnNext = true;
    }
  },

  options: options,

  paths:  {
    projectRoot: projectRoot,
    rootDir: rootDir,
    targets: targets,
    reportsDir: reportsDir,

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

  closeActiveServers: function (cb) {
    var async = require('async');
    async.parallel(
      // make an array of functions that are bound to close each
      // server in activeServers (and thus attempt close them all in parallel)
      _.map(activeServers, function (server) {
        return closeServer.bind(null, server);
      }),
      // when all have called back, call back the caller
      cb
    );
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
            request(options.addresses.appServer.href + 'v1' + req.url)
          )
          .on('error', function (err) {
            console.log(err);
          })
          .pipe(res);
        });

      if (options.html5Mode) {
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
        port: options.liveReloadPorts.unitCoverage
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
    return argv._[0] || 'default';
  },

  isChildProcess: function () {
    return argv.asChild;
  },

  restartChild: function () {
    if (gulpChild) {
      gulpChild.kill('SIGINT');
    }

    var argsArray = process.argv.slice(2).concat('--as-child');
    argsArray.unshift('node_modules/gulp/bin/gulp.js');
    console.log(argsArray);
    console.log('SPAWN GULP');
    gulpChild = childProcess.spawn(
      'node',
      argsArray,
      { stdio: 'inherit' }
    );
  }
};
