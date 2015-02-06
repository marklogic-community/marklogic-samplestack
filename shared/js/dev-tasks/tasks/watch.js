var path = require('path');

var readArray = require('event-stream').readArray;
var chalk = require('chalk');
var gulp = require('gulp');

var ctx = require('../context');
var helper = require('../helper');
var $ = helper.$;

var addresses = ctx.options.addresses;

var runBuild = require('../build/runBuild');
var runUnit = require('../unit/runUnit');

var myTasks = [];
myTasks.push({
  name: 'watchCalled',
  deps: [],
  func: function (cb) {
    ctx.watchTaskCalled = true;
    cb();
  }
});

function writeWatchMenu () {
  var ten = '          ';
  var message;

  message = '\n' + ten +
      '--> ' + chalk.magenta('BUILD') + '        : ' +
      chalk.bold.blue(addresses.webApp.href) +
      '\n' + ten +
      '--> ' + chalk.magenta('UNIT TESTS') + '   : ' +
      chalk.bold.blue(addresses.unitRunner.href) +
      '\n' + ten +
      '--> ' + chalk.magenta('COVERAGE') + '     : ' +
      chalk.bold.blue(addresses.unitCoverage.href) +
      '\n' + ten +
      'watching for ' + chalk.green('changes') + ' to the ' +
      chalk.red.italic.dim('src') + ' and ' +
      chalk.red.italic.dim('test') + ' directories\n';

  process.stdout.write(message);
}

function refireWatchTask (servers) {
  ctx.rebuildOnNext = false;
  ctx.closeActiveServers(gulp.start.bind(gulp, 'watch'));
}

// TODO: what the heck does fileRelativizer do?
function lrSetup (port, glob, name, fileRelativizer, cb) {
  if (ctx.getActiveServer(port)) {
    if (cb) {
      return cb();
    }
    else {
      return;
    }
  }

  var tinylr = require('tiny-lr-fork');
  var lrServer = new tinylr.Server();
  lrServer.listen(port, function () {
    var watcher = $.watch(
      glob,
      {
        name: name, // 'reload-watch',
        emitOnGlob: false,
        emit: 'one',
        debounceDelay: 250,
        verbose: false
      }
    )
    .on('data', function (file) {
      // TODO: this file.base seems strange
      file.base = path.resolve('./build');
      lrServer.changed({
        body: {
          files: [
            fileRelativizer(file)
          ]
        }
      });
      return file;
    });
    watcher.on('error', function (e) {
      console.log('caught gaze error: ' + e.toString());
    });
    ctx.setActiveServer(name, watcher);
    ctx.setActiveServer(port, lrServer);
    if (cb) {
      cb();
    }
  });
}

function lrManualSetup (port, cb) {
  if (!ctx.getActiveServer(port)) {
    var tinylr = require('tiny-lr-fork');
    var lrServer = new tinylr.Server();

    lrServer.listen(port, function () {
      var changer = function (files) {
        lrServer.changed({ body: { files: files } });
      };
      ctx.setActiveServer(port, lrServer);
      cb(changer);
    });
  }
  else {
    cb();
  }
}

var watchTaskFunc = function (cb) {
  var lrChanger;
  if (!ctx.amWatching) {
    ctx.startServer(ctx.paths.browser.buildDir, addresses.webApp.port);
    ctx.startServer(ctx.paths.browser.unitDir, addresses.unitRunner.port);
    ctx.startIstanbulServer(
      ctx.paths.browser.unitDir, addresses.unitCoverage.port
    );
    ctx.amWatching = true;

    lrManualSetup(
      ctx.options.liveReloadPorts.unitCoverage,
      function (changer) {
        lrChanger = changer;
      }
    );
  }

  var watcher = $.watch(
    [
      path.join(ctx.paths.browser.srcDir, '**/*'),
      path.join(ctx.paths.browser.unitSrcDir, '**/*')
    ],
    {
      name: 'watch',
      emitOnGlob: false,
      emit: 'one',
      verbose: false
    },
    function (file) {
      // determine path relative to project root
      // TODO: seems only used for the immediate "need" of logging it
      var relpath = path.relative(
        ctx.paths.projectRoot, file.path
      );
      $.util.log('[' + chalk.cyan('watch') + '] ' +
          chalk.bold.blue(relpath) + ' was ' + chalk.magenta(file.event));

      if (!(file.event === 'changed' || file.event === 'added')) {
        refireWatchTask();
      }
      else if (ctx.rebuildOnNext) {
        $.util.log('[' + chalk.cyan('watch') + '] ' +
            chalk.yellow(
              'some changes not written on previous change -- rebuilding'
            ));
        refireWatchTask();
      }
      else {

        var files = readArray([file]);

        var out = runBuild(files).pipe(
          $.util.buffer(function (err, files) {
            if(!ctx.rebuildOnNext && !ctx.hadErrors) {
              runUnit({ reporter: 'dot' }, function () {
                ctx.deployBuilt(function (err) {
                  try {
                    // sometimes this isn't working due to task restarts?
                    // don't crash
                    lrChanger(['/coverage', '/coverage/show']);
                  }
                  catch (err) {}

                  if (!err) {
                    writeWatchMenu();
                  }
                });
              });
            }
            else {
              writeWatchMenu();
            }
          })
        );
      }
    }
  );
  watcher.on('error', function (e) {
    console.log('watcher error: ' + e.toString());
  });

  ctx.setActiveServer('watcher', watcher);

  if (!ctx.getActiveServer('reload-build-watch')) {
    lrSetup(
        ctx.options.liveReloadPorts.webApp,
      [ path.join(ctx.paths.browser.targets.built, '**/*') ],
      'reload-build-watch',
      function (file) {
        file.base = path.resolve('./build');
        return file.relative;
      },
      function () {
        writeWatchMenu();
        if (cb) {
          // if we restarted this function then no cb is available or
          // necessary
          cb();
        }
      }
    );
  }
  else {
    writeWatchMenu();
    if (cb) {
      cb();
    }
  }

};

var devTasksDir = path.resolve(ctx.paths.projectRoot, 'shared/js/dev-tasks');
var setProcessWatch = function () {
  var watcher = $.watch([
    // TODO: watch every dir involved in automation (minus node_modules)?
    path.join(devTasksDir, 'build/**/*'),
    path.join(devTasksDir, 'tasks/**/*'),
    path.join(devTasksDir, 'unit/**/*'),
    path.join(devTasksDir, '*'), // not deeply!
    path.join(ctx.paths.browser.rootDir, '*.js')
  ],
  {
    name: 'processWatch',
    emitOnGlob: false,
    emit: 'one',
    // TODO: this debounceDelay helping or hurting?
    debounceDelay: 250,
    verbose: false
  }, function (file, gulpWatchCb) {
    console.log(
      chalk.yellow('saw change to project structure... restarting gulp')
    );
    // ctx.closeActiveServers(function () {
    ctx.restartChild();
    // });
  });
  ctx.setActiveServer('processWatcher', watcher);
  watcher.on('error', function (e) {
    console.log('watcher error: ' + e.toString());
  });


};



myTasks.push({
  name: 'watch',
  deps: ['watchCalled', 'build', 'unit'],
  func: function (cb) {
    setProcessWatch();
    watchTaskFunc(cb);
  }
});

module.exports = myTasks;
