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

var activeServers;
// schedule next build to be a full rebuild due to current build problem
var rebuildOnNext = false;
// did we encounter errors?
// TODO: is this different than rebuildOnNext?
var hadErrors = false;

// TODO: consolidate path definitions into some sort of paths.js file
var projectRoot = path.resolve(__dirname, '../../..');
var browserRootDir = path.resolve(projectRoot, 'browser');
var serverRootDir = path.resolve(projectRoot, 'appserver/node-express');
var reportsDir = path.resolve(projectRoot, 'reports');

var browserBuilds =  {
  // TODO: these relatie paths are sketchy
  built: path.normalize('builds/built'),
  unit: path.normalize('builds/unit-tester'),
  dist: path.normalize('builds/dist')
};

var serverBuilds =  {
  // TODO: these relatie paths are sketchy
  built: serverRootDir,
  // unit: ,
  // dist:
};

var javaStaticDir = path.resolve(
  projectRoot, 'appserver/java-spring/static'
);

var self;
var gulpChild;
var closing = false;

var rimraf = require('rimraf');
var fs = require('fs');

var deployBuilt = function (cb) {
  $.util.log(chalk.green('(deploying static browser build...)'));

  var src = path.resolve(browserRootDir, browserBuilds.built);
  var dest = javaStaticDir;

  var isntSpecial = function (path) {
    // index.html and application.js are special
    // TODO: these "patterns" are sloppy b/c not rooted
    return path.indexOf('index.html') < 0 && path.indexOf('application.js') < 0;
  };

  // clear the dir
  rimraf(dest, function (err) {
    if (err) {
      $.util.log(chalk.red('Error Deploying static build: ' + err));
      return cb(err);
    }
    // copy most of the files
    // TODO: replace with gulp.src/dest
    var stream = gulp.src([
      path.join(src, '**/*'), '!application.js', '!index.html'
    ])
      .pipe(gulp.dest(dest));

    stream.on('error', function (err) {
      if (err) {
        $.util.log(chalk.red('Error Deploying static build: ' + err));
        return cb(err);
      }
    });

    stream.on('end', function () {
      try {
        // handle special files
        var index = fs.readFileSync(
          path.join(src, 'index.html'), { encoding: 'utf8' }
        );
        index = index.replace(/<script.*livereload.*script>/, '');
        fs.writeFileSync(path.join(dest, 'index.html'), index);

        var appjs = fs.readFileSync(
          path.join(src, 'application.js'), { encoding: 'utf8' }
        );
        appjs = appjs.replace('html5Mode: true', 'html5Mode: false');
        fs.writeFileSync(path.join(dest, 'application.js'), appjs);
        $.util.log(chalk.green('(...static build deployed)'));
      }
      catch (err) {
        $.util.log(chalk.red('Error Deploying static build: ' + err));
        return cb(err);
      }

      cb();
    });
  });

};

var closeServer = function (server, cb) {
  var closed = false;
  var onClosed = function () {
    if (!closed) {
      closed = true;
      try {
        cb();
      }
      catch (err) {}
    }
  };
  try {
    if (server.on) {
      // a standard node process
      server.on('end', onClosed);
      server.on('close', onClosed);
      server.on('exit', onClosed);
    }
    if (server.close) {
      // a manually managed process of ours
      server.close(onClosed);
    }
    else {
      if (server.kill) {
        server.kill();
      }
      else {
        // this isn't really an external process
        cb();
      }
    }
  }
  catch (err) {
    onClosed(err);
  }
};

process.on('SIGINT', function () {
  if (self.parentPid()) {
    // as a child process, this is a real worker, so close the servers and
    // get out
    self.closeActiveServers(function () {
      process.exit(0);
    });
  }
  else {
    // as the parent process, a SIGINT means close both the child and the self
    if (gulpChild) {
      // this message will eventually get things cleaned up and then exit
      gulpChild.on('exit', function () {
        process.exit(0);
      });
      gulpChild.kill('SIGINT');
    }
    else {
      // no chid process means we weren't really doing anything anyway
      process.exit(0);
    }
  }
});

self = module.exports = {
  errorHandler: function (err) {
    self.hadErrors = true;
    var errString;
    try {
      errString = JSON.stringify(err, false, ' ');
    }
    catch (myErr) {
      errString = err.toString().trim();
    }
    var preMessage = chalk.stripColor(errString).indexOf('Error') === 0 ?
    '' :
    $.util.colors.red('Error: ');
    $.util.log(
      preMessage + errString +
      (err.stack ? '\n' + err.stack + '\n' : '\n')
    );
    self.rebuildOnNext = true;
  },

  options: options,

  paths:  {
    projectRoot: projectRoot,
    middle: {
      lib: path.join(serverRootDir, 'lib')
    },
    browser: {
      rootDir: browserRootDir,
      targets: browserBuilds,
      src: 'src',
      unit: path.normalize('test/unit-tests'),
      builds: 'builds',
      buildsRoot: path.join(browserRootDir, 'builds'),
      buildDir: path.join(browserRootDir, browserBuilds.built),
      unitDir: path.join(browserRootDir, browserBuilds.unit),
      distDir: path.join(browserRootDir, browserBuilds.dist),
      srcDir: path.join(browserRootDir, 'src'),
      unitSrcDir: path.join(browserRootDir, 'test/unit-tests'),
      unitPattern: path.join(browserRootDir, 'unit/**/*'),
      srcPattern: path.join(browserRootDir, 'src/**/*')
    },
    reportsDir: reportsDir,

  },

  deployBuilt: deployBuilt,

  closeServer: closeServer,

  closeActiveServer: function (key, cb) {
    var server = activeServers && activeServers[key.toString()];
    if (server) {
      closeServer(server, function (err) {
        delete activeServers[key.toString];
        cb();
      });
    }
  },

  closeActiveServers: function (callback) {
    if (!closing) {
      closing = true;

      var async = require('async');
      async.parallel(
        // make an array of functions that are bound to close each
        // server in activeServers (and thus attempt close them all in parallel)
        _.map(activeServers, function (server, key) {
          return function (cb) {
            var waitTime = 1000;
            if (key === 'middle-tier') {
              waitTime = 5000; //java is slow to exit
            }
            $.util.log(chalk.green('shutting down ' + key));
            var closed = false;
            setTimeout(function () {
              if (!closed) {
                $.util.log(chalk.yellow(
                  'No exit event from ' + key + '. Proceeding with exit...'
                ));
                try {
                  cb();
                }
                catch (err) { console.log(err); }
              }
            }, waitTime);
            closeServer(
              server,
              function (err) {
                if (err && err.toString().indexOf('isRunning')) {
                  cb();
                  closed = true;
                }
                else {
                  cb(err);
                  closed = true;
                }
              }
            );
          };
        }),
        // when all have called back, call back the caller
        function () {
          activeServers = null;
          closing = false;
          callback();
        }
      );
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



  // TODO: let's stop using connect and stick to express?
  // this needs to be reconciled w/middle-tier express app
  // Alternatively, we could leave this and always run middle-tier
  // on port 8090?
  startServer: function (filePath, port, html5) {
    var argv = require('yargs').argv;
    var runProxy = argv.middleTier === 'external' ||
        argv.middleTier === 'java';
    if (runProxy) {
      var url = require('url');

      var prev = options.addresses.appServer;
      options.addresses.appServer = url.parse(
        url.format(prev).replace('3000', '8090')
      );
    }

    if (port === '3000' && !runProxy) {
      if (this.watchTaskCalled) {
        var middleProcess = childProcess.fork(
          path.join(serverBuilds.built, 'main')
        );
        self.setActiveServer(port, middleProcess);
      }
      else {
        self.setActiveServer(
          port, require(path.join(serverRootDir, 'main'))
        );
      }
    }
    else {
      // console.log('don\'t start middle tier -- ' + port);
      if (!self.getActiveServer(port)) {
        var connect = require('connect');
        var serveStatic = require('serve-static');
        var request = require('request').defaults({
          timeout: 10000
        });

        var server = connect()
        .use('/v1/', function (req, res) {
          req.pipe(
            request({
              url: options.addresses.appServer.href + 'v1' + req.url,
              // 31 seconds, one more than the browser will wait
              timeout: 61 * 1000
            })
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
        .use(serveStatic(path.normalize(filePath), {redirect: false}))
        .listen(port, '0.0.0.0');

        listener.on('error', function (err) {
          console.log(err);
        });
        self.setActiveServer(port, listener);

        return server;
      }
      else {
        return self.getActiveServer(port);
      }
    }
  },


  // start an express server to serve the static app and also
  // run istanbul middleware, to which the unit tests
  // will report coverage (and from which we can see coverage report)
  //
  // TODO:
  // 1) not useful for tracking middle-tier (yet)
  // 2) not used for e2e coverage (yet)
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

  // waht is the name of the task we're assigned to run?
  currentTask: argv._[0] || 'default',

  // what was this process told about its parent pid?
  // If we have a parentPid, then this is the restartable child process that
  // runs in long-lived tasks (e.g. watch) so that the build env. can be
  // restarted when the bulid env source is modified
  parentPid: function () {
    return argv.parentPid;
  },


  // start or gently restart a child version of the process.
  // as the child is started, set it up to listen for restartChild
  // messages.. If not currently running as a child, send the message
  // to the child.
  // "Gently" restarting a child means sending the child a SIGINT and waiting
  // for it to exit.
  // TODO: This code say that if this is the parent process, recurse the
  // function, but why is that?
  restartChild: function () {
    var start = function () {
      var argsArray = process.argv.slice(2);
      var execArgv = [];
      if (argv.debugChild) {
        execArgv.push('--debug=5859');
        execArgv.push('--debug-brk');
      }
      gulpChild = childProcess.fork(
        path.resolve(projectRoot, 'node_modules/gulp/bin/gulp.js'),
        argsArray.concat('--parent-pid=' + process.pid),
        { cwd: process.cwd(), execArgv: execArgv }
      );

      gulpChild.on('message', function (m) {
        if (m.restartChild) {
          self.restartChild();
        }
      });
    };

    if (self.parentPid()) {
      process.send( {'restartChild': true });
    }
    else {
      if (gulpChild) {
        gulpChild.on('exit', start);
        gulpChild.kill('SIGINT');
      }
      else {
        start();
      }
    }
  }
};
