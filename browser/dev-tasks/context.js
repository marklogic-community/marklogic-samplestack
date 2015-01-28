

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
  build: path.normalize('builds/built'),
  unit: path.normalize('builds/unit-tester'),
  dist: path.normalize('builds/dist')
};

var self;
var gulpChild;
var closing = false;

var ncp = require('ncp');
var del = require('del');
var fs = require('fs');

var deployBuilt = function (cb) {
  $.util.log(chalk.green('(deploying static build...)'));

  var src = path.resolve(
    __dirname, '../builds/built'
  );
  var dest = path.resolve(
    __dirname, '../../appserver/java-spring/static'
  );

  var isntSpecial = function (path) {
    return path.indexOf('index.html') < 0 && path.indexOf('application.js') < 0;
  };

  del(path.join(dest, '**/*'), { force: true }, function (err) {
    if (err) {
      $.util.log(chalk.red('Error Deploying static build: ' + err));
      return cb(err);
    }
    ncp(
      src, dest, { clobber: true, filter: isntSpecial }, function (err) {
        if (err) {
          $.util.log(chalk.red('Error Deploying static build: ' + err));
          return cb(err);
        }
        try {
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
          return cb(err);
        }

        cb();
      }
    );
  });

};

var closeServer = function (server, cb) {
  var closed = false;
  var onClosed = function () {
    if (!closed) {
      closed = true;
      cb();
    }
  };
  try {
    server.on('end', onClosed);
    server.on('close', onClosed);
    server.close(onClosed);
  }
  catch (err) {
    onClosed();
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
    var errString = err.toString().trim();
    var preMessage = chalk.stripColor(errString).indexOf('Error') === 0 ?
    '' :
    $.util.colors.red('Error: ');
    $.util.log(
      preMessage + err.toString().trim() +
      (err.stack ? '\n' + err.stack + '\n' : '\n')
    );
    self.rebuildOnNext = true;
  },

  options: options,

  paths:  {
    projectRoot: projectRoot,
    rootDir: rootDir,
    targets: targets,
    reportsDir: reportsDir,

    src: 'src',
    unit: path.normalize('test/unit-tests'),
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

  deployBuilt: deployBuilt,

  closeServer: closeServer,

  closeActiveServer: function (key, cb) {
    var server = activeServers && activeServers[key.toString()];
    if (server) {
      closeServer(server, function () {
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
            }, 1000);
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


  startServer: function (filePath, port, html5) {
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
            timeout: 31 * 1000
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
      self.setActiveServer(port, server);

      return server;
    }
    else {
      return self.getActiveServer(port);
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

currentTask: argv._[0] || 'default',

parentPid: function () {
  return argv.parentPid;
},


restartChild: function () {
  var start = function () {
    var argsArray = process.argv.slice(2);
    gulpChild = childProcess.fork(
      path.resolve(
        __dirname, '../node_modules/gulp/bin/gulp.js'
      ),
      argsArray.concat('--parent-pid=' + process.pid),
    { cwd: process.cwd() }
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
