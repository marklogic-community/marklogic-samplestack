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
  var lrUnitChanger;
  var lrBuildChanger;

  ctx.startServer(ctx.paths.browser.buildDir, addresses.webApp.port);
  if (!ctx.amWatching) {
    ctx.startServer(ctx.paths.browser.unitDir, addresses.unitRunner.port);
    ctx.startIstanbulServer(
      ctx.paths.browser.unitDir, addresses.unitCoverage.port
    );
    ctx.amWatching = true;

    lrManualSetup(
      ctx.options.liveReloadPorts.unitCoverage,
      function (changer) {
        lrUnitChanger = changer;
      }
    );
  }

  var browserWatcher = $.watch(
    [
      path.join(ctx.paths.browser.srcDir, '**/*'),
      path.join(ctx.paths.browser.unitSrcDir, '**/*')
    ],
    {
      name: 'watch',
      ignoreInitial: true,
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
          chalk.bold.blue(relpath) + ' -- ' + chalk.magenta(file.event));

      if (!(file.event === 'change' || file.event === 'add')) {
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
            lrBuildChanger(['/', '/index.html']);
            if(!ctx.rebuildOnNext && !ctx.hadErrors) {
              runUnit({ reporter: 'dot' }, function () {
                ctx.deployBuilt(function (err) {
                  try {
                    // sometimes this isn't working due to task restarts?
                    // don't crash
                    lrUnitChanger(['/coverage', '/coverage/show']);
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
  browserWatcher.on('error', function (e) {
    console.log('watcher error: ' + e.toString());
  });

  ctx.setActiveServer('watcher', browserWatcher);


  var middleWatcher = $.watch(
    path.join(ctx.paths.middle.lib, '**/*'),
    {
      name: 'watchMiddle',
      ignoreInitial: true,
      emitOnGlob: false,
      emit: 'one',
      verbose: false
    },
    function (file) {
      ctx.closeActiveServer(
        addresses.webApp.port,
        function () {
          ctx.startServer(ctx.paths.browser.buildDir, addresses.webApp.port);
          writeWatchMenu();
        }
      );
    }
  );

  if (!ctx.getActiveServer('reload-build-watch')) {
    lrManualSetup(
      ctx.options.liveReloadPorts.webApp,
      function (changer) {
        lrBuildChanger = changer;
      }
    );
  }
  writeWatchMenu();
  if (cb) {
    cb();
  }

};

var devTasksDir = path.resolve(ctx.paths.projectRoot, 'shared/js/dev-tasks');
var setProcessWatch = function () {
  var watcher = $.watch([
    path.join(devTasksDir, '/**/*'), // deeply
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
