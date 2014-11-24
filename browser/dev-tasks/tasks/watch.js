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
  ctx.closeActiveServers(gulp.start.bind(null, 'watch'));
}

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
        verbose: false
      }
    )
    .on('data', function (file) {
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
    ctx.startServer(ctx.paths.targets.build, addresses.webApp.port);
    ctx.startServer(ctx.paths.targets.unit, addresses.unitRunner.port);
    ctx.startIstanbulServer(
      ctx.paths.targets.unit, addresses.unitCoverage.port
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
      path.join(ctx.paths.srcDir, '**/*'),
      path.join(ctx.paths.unitSrcDir, '**/*')
    ],
    {
      name: 'watch',
      emitOnGlob: false,
      emit: 'one',
      verbose: false
    },
    function (file, gulpWatchCb) {
      file.pipe($.util.buffer(function (err, files) {
        var relpath = path.relative(
          path.join(__dirname, '../src'), files[0].path
        );
        $.util.log('[' + chalk.cyan('watch') + '] ' +
            chalk.bold.blue(relpath) + ' was ' + chalk.magenta(files[0].event));

        if (!(files[0].event === 'changed' || files[0].event === 'added')) {
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
          files = readArray(files);

          var out = runBuild(files).pipe(
            $.util.buffer(function (err, files) {
              if(!ctx.rebuildOnNext && !ctx.hadErrors) {
                runUnit({ reporter: 'dot' }, function () {
                  lrChanger(['/coverage', '/coverage/show']);
                  gulpWatchCb();
                  writeWatchMenu();
                });
              }
              else {
                gulpWatchCb();
                writeWatchMenu();
              }
              ctx.deployBuilt();
            })
          );
        }
      }));
    }
  );
  watcher.on('error', function (e) {
    console.log('watcher error: ' + e.toString());
  });

  ctx.setActiveServer('watcher', watcher);

  lrSetup(
      ctx.options.liveReloadPorts.webApp,
    [ path.join(ctx.paths.targets.build, '**/*') ],
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

};
//
// var refireWatchFunc = function (cb) {
//   if (ctx.amWatching) {
//     ctx.amWatching = false;
//     $.util.log('[' + chalk.cyan('watch') + '] ' +
//         chalk.yellow(
//           'restarting watch'
//         ));
//     ctx.closeActiveServers(function () {
//       ctx.rebuildOnNext = true;
//       watchTaskFunc(cb);
//     });
//   }
// };

var setProcessWatch = function () {
  var watcher = $.watch([
    path.join(ctx.paths.rootDir, 'dev-tasks/build/**/*'),
    path.join(ctx.paths.rootDir, 'dev-tasks/tasks/**/*'),
    path.join(ctx.paths.rootDir, 'dev-tasks/unit/**/*'),
    path.join(ctx.paths.rootDir, 'dev-tasks/*'),
    path.join(ctx.paths.rootDir, '*.js')
  ],
  {
    name: 'processWatch',
    emitOnGlob: false,
    emit: 'one',
    verbose: false
  }, function (file, gulpWatchCb) {
    console.log(
      chalk.yellow('saw change to project structure... restarting gulp')
    );
    gulpWatchCb();
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
