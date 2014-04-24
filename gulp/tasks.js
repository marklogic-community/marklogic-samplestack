/**
 * Proto-tasks -- the objects exported are to be converted to tasks by a
 * gulpfile.  This module exists to allow for its tasks to be driven
 * from outside of this project (.e.g from a larger app that combines
 * a Node.js server with this browser app).
 * @type {Object}
 */
var tasks = module.exports = {};

var path = require('path');
var _ = require('lodash');
var lazypipe = require('lazypipe');
var fs = require('fs');
var chalk = require('chalk');
var glob = require('glob');
var gulp = require('gulp');
// var async = require('async');
var merge = require('event-stream').merge;
var readArray = require('event-stream').readArray;

var h = require('./helper');
var buildParams = require('../buildParams');

// make it easier to get to plugins
var $ = h.$;

var bootstrapDir =
    'bower_components/bootstrap-sass-official/vendor/assets/stylesheets';
// this is a process-wide task, not file-type specific
tasks.clean = {
  deps: [],
  func: function() {
    return h.fs.src([
      path.join(h.targets.build),
      path.join(h.targets.unit),
      path.join(h.targets.dist)
    ], {read: false})
      .pipe($.rimraf());
  }
};

tasks['bower'] = {
  deps: ['clean'],
  func: function() {
    return h.fs.src('bower_components/**/*')
      .pipe(h.fs.dest(path.join(h.targets.build, 'js/bower_components')))
      .pipe(h.fs.dest(path.join(h.targets.unit, 'js/bower_components')));
  }
};

var buildStream = function(src) {
  // there are some things we can do before we diverge

  /***************
  JSHINT
  ****************/
  var jsFilt = $.filter('**/*.js');
  var srcDir = path.join(__dirname, '..', h.src);
  src = src.pipe(jsFilt)
    .pipe($.jshint(path.join(srcDir, '.jshintrc')))
    .pipe($.jshint.reporter('jshint-stylish'));
  // jscs can't handle lodash templates, so wait
  // .pipe($.jscs(path.join(srcDir, '.jscsrc')));
  src = src.pipe(jsFilt.restore());

  /***************
  SASS
  ****************/
  var sassFilt = $.filter(['**/*.scss', '!**/_*.scss']);
  src = src.pipe(sassFilt).pipe($.sass({
    sourceComments: 'map',
    includePaths: [bootstrapDir]
  })).pipe(sassFilt.restore().pipe($.filter('!**/*.scss')));

  var targets = $.branchClones({ src: src, targets: ['build', 'unit']});

  var build = targets['build'].pipe($.rebase(h.targets.build));
  var unit = targets['unit'].pipe($.rebase(h.targets.unit));
  // var dist = targets['dist'].pipe($.rebase(h.targets.dist));

  /****************
  TEMPLATE
  *****************/
  var templateFilt;
  // danger -- the filter has a memory, get a new one each time
  templateFilt = $.filter(['**/*.html', '**/*.js']);
  build = build.pipe(templateFilt)
    .pipe($.template(buildParams.build))
    .pipe(templateFilt.restore());
  templateFilt = $.filter(['**/*.html', '**/*.js']);
  unit = unit.pipe(templateFilt)
    .pipe($.template(buildParams.unit))
    .pipe(templateFilt.restore());
  templateFilt = $.filter(['**/*.html', '**/*.js']);
  // dist = dist.pipe(templateFilt)
  //   .pipe($.template(buildParams.dist))
  //   .pipe(templateFilt.restore());

  // src = merge(build, unit, dist);
  src = merge(build, unit);
  // return src.pipe($.debug());
  return src.pipe(h.fs.dest('.'));


};

tasks.build = {
  deps: ['clean', 'bower'],
  func: function() {
    var src = h.fs.src(path.join(h.src, '**/*'));

    return buildStream(src);
  }
};

// var buildServer;
function startServer(path, port) {
  var connect = require('connect');
  var server = connect()
    .use(require('connect-modrewrite')(
      // if lacking a dot, redirect to index.html
      ['!\\. /index.html [L]']))
    .use(connect.static(path, {redirect: false}))
    .listen(port, '0.0.0.0');
  return server;
}

tasks['unit'] = {
  deps: ['build'],
  func: function(cb) {
    var tempServer = startServer(h.targets.unit, 3001);
    h.fs.src(path.join(h.targets.unit, 'unit-runner.html'))
    .pipe($.mochaPhantomjs())
    .pipe($.util.buffer(
        function(err, files) {
          tempServer.close();
          cb();
        }));
  }
};

function writeWatchMenu() {
  $.util.log('[' + chalk.cyan('watch') + '] ' +
      'watching for changes to the ' + chalk.magenta(h.src) + ' directory.');
  $.util.log('[' + chalk.cyan('watch') + '] ' +
      '--> ' + chalk.magenta('build server') + ': ' +
      chalk.bold.blue('http://localhost:3000'));
  $.util.log('[' + chalk.cyan('watch') + '] ' +
      '--> ' + chalk.magenta('unit test runner') + ': ' +
      chalk.bold.blue('http://localhost:3001/unit-runner.html'));
}

var activeWatchers;
var activeServers;
tasks['watch'] = {
  deps: ['build', 'unit'],
  func: function(cb) {
    activeWatchers = [];
    activeServers = [];
    activeServers.push(startServer(h.targets.build, 3000));
    activeServers.push(startServer(h.targets.unit, 3001));

    var watcher = $.watch({
      glob: path.join(h.src, '**/*'),
      name: 'watch',
      emitOnGlob: false,
      emit: 'one',
      silent: true
    }, function(file, cb) {
      file.pipe($.util.buffer(function(err, files) {

        var relpath = path.relative(
          path.join(__dirname, '../src'), files[0].path
        );
        $.util.log('[' + chalk.cyan('watch') + '] ' +
            chalk.bold.blue(relpath) + ' was ' + chalk.magenta(files[0].event));

        if (!(files[0].event === 'changed' || files[0].event === 'added')) {
          $.util.log('[' + chalk.cyan('watch') + '] ' +
              chalk.bold.yellow('initiating rebuild'));
          activeWatchers.forEach(function(watcher) {
            watcher.close();
          });
          activeServers.forEach(function(server) {
            server.close();
          });
          gulp.start('watch');
        }
        else {
          files = readArray(files);

          buildStream(files).pipe(
            $.util.buffer(function(err, files) {
              h.fs.src(path.join(h.targets.unit, 'unit-runner.html'))
              .pipe($.mochaPhantomjs())
              .pipe($.util.buffer(
                  function(err, files) {
                    writeWatchMenu();
                    cb();
                  }
              ));
            })
          );
        }
      }));
    });
    activeWatchers.push(watcher);

    var port = 35729;
    var tinylr = require('tiny-lr-fork');
    var buildLr = new tinylr.Server();
    buildLr.listen(port, function() {
      watcher = $.watch({
        glob: path.join(h.targets.build, '**/*'),
        name: 'reload-watch',
        emitOnGlob: false,
        emit: 'one',
        silent: true
      })
      .on('data', function(file) {
        file.base = path.resolve('./build');
        buildLr.changed({body: { files: [file.relative]}});
        return file;
      });
      activeWatchers.push(watcher);
      activeServers.push(buildLr);

      writeWatchMenu();

      cb();

    });
  }
};
