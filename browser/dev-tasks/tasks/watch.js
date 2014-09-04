var path = require('path');

var readArray = require('event-stream').readArray;
var chalk = require('chalk');
var gulp = require('gulp');

var ctx = require('../context');
var helper = require('../helper');
var $ = helper.$;

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
      chalk.bold.blue('http://localhost:3000') +
      '\n' + ten +
      '--> ' + chalk.magenta('UNIT TESTS') + '   : ' +
      chalk.bold.blue('http://localhost:3001/unit-runner.html') +
      '\n' + ten +
      '--> ' + chalk.magenta('COVERAGE') + '     : ' +
      chalk.bold.blue('http://localhost:3004/coverage') +
      '\n' + ten +
      'watching for ' + chalk.green('changes') + ' to the ' +
      chalk.red.italic.dim('src') + ' and ' +
      chalk.red.italic.dim('test') + ' directories\n';

  process.stdout.write(message);
}

function refireWatchTask (servers) {
  ctx.closeActiveServers();
  ctx.rebuildOnNext = false;
  gulp.start('watch');
}

function lrSetup (port, glob, name, fileRelativizer, cb) {
  var tinylr = require('tiny-lr-fork');
  var lrServer = new tinylr.Server();
  lrServer.listen(port, function () {
    var watcher = $.watch({
      glob: glob, // path.join(h.targets.build, '**/*'),
      name: name, // 'reload-watch',
      emitOnGlob: false,
      emit: 'one',
      silent: true
    })
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

var watchTaskFunc = function (cb) {
  ctx.startServer(ctx.paths.targets.build, 3000);
  ctx.startServer(ctx.paths.targets.unit, 3001);
  ctx.startIstanbulServer(ctx.paths.targets.unit, 3004);
  ctx.amWatching = true;

  var lrChanger;
  lrManualSetup(
    35730,
    function (changer) {
      lrChanger = changer;
    }
  );


  var watcher = $.watch({
    glob: [
      path.join(ctx.paths.srcDir, '**/*'),
      path.join(ctx.paths.unitSrcDir, '**/*')
    ],
    name: 'watch',
    emitOnGlob: false,
    emit: 'one',
    silent: true
  }, function (file, gulpWatchCb) {
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
          })
        );
      }
    }));
  });
  watcher.on('error', function (e) {
    console.log('watcher error: ' + e.toString());
  });

  ctx.setActiveServer('watcher', watcher);

  lrSetup(
    35729,
    path.join(ctx.paths.targets.build, '**/*'),
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

var refireWatchFunc = function () {
  if (ctx.amWatching) {
    ctx.amWatching = false;
    $.util.log('[' + chalk.cyan('watch') + '] ' +
        chalk.yellow(
          'restarting watch'
        ));
    ctx.closeActiveServers();
    ctx.rebuildOnNext = true;
    watchTaskFunc();
  }
};

var setProcessWatch = function () {
  var watcher = $.watch({
    glob: [
      path.join(ctx.paths.rootDir, 'dev-tasks/build/**/*'),
      path.join(ctx.paths.rootDir, 'dev-tasks/tasks/**/*'),
      path.join(ctx.paths.rootDir, 'dev-tasks/unit/**/*'),
      path.join(ctx.paths.rootDir, 'dev-tasks/*')
    ],
    name: 'processWatch',
    emitOnGlob: false,
    emit: 'one',
    silent: true
  }, function (file, gulpWatchCb) {
    console.log(
      chalk.yellow('saw change to project structure... restarting gulp')
    );
    ctx.closeActiveServers();
    gulpWatchCb();
    ctx.restartChild();
  });
  watcher.on('error', function (e) {
    console.log('watcher error: ' + e.toString());
  });

  ctx.setActiveServer('processWatcher', watcher);

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
