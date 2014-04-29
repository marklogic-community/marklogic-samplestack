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
var fs = require('fs');
var chalk = require('chalk');
var gulp = require('gulp');
var merge = require('event-stream').merge;
var readArray = require('event-stream').readArray;

var h = require('./helper');
var buildParams = require('../buildParams');

// make it easier to get to plugins
var $ = h.$;

var bootstrapDir =
    'bower_components/bootstrap-sass-official/vendor/assets/stylesheets';


/**************************
stuff about dealing with
watch having to be restarted
**************************/
var amWatching = false;
var activeServers;
var rebuildOnNext = false;

function refireWatchTask(servers) {
  // $.util.log('[' + chalk.cyan('watch') + '] ' +
  //     chalk.yellow('initiating rebuild'));
  activeServers.forEach(function(server) {
    try {
      server.close();
    } catch (err) {}
  });
  rebuildOnNext = false;
  gulp.start('watch');
}

function refireWatchFunc() {
  if (amWatching) {
    amWatching = false;
    $.util.log('[' + chalk.cyan('watch') + '] ' +
        chalk.yellow(
          'restarting watch'
        ));
    activeServers.forEach(function(server) {
      try {
        server.close();
      } catch (err) {}
    });
    rebuildOnNext = true;
    tasks['watch'].func();
  }
}

function trim(str) { return str.replace(/^\s+|\s+$/g, ''); }
var plumberErrorHandler = function(err) {
  $.util.log(
            $.util.colors.cyan('Plumber') +
            chalk.red(' found unhandled error:\n\n') +
            trim(err.toString()) + '\n');
  if (!rebuildOnNext) {
    rebuildOnNext = true; // rebuild after the next save
    $.util.log('[' + chalk.cyan('watch') + '] ' +
        chalk.yellow(
          'some changes not written -- will rebuild on next change'
        ));
    if (amWatching) {
      refireWatchFunc();
    }
  }
};

/********************
tasks
********************/

// rimraf all of the target directories
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

// copy all of the bower components
// to the unit test and build targets
tasks['bower'] = {
  deps: ['clean'],
  func: function() {
    return h.fs.src('bower_components/**/*')
      .pipe(h.fs.dest(path.join(h.targets.build, 'js/bower_components')))
      .pipe(h.fs.dest(path.join(h.targets.unit, 'js/bower_components')));
  }
};

/*************************
this is the main building
function for builds and
incremental watch buils
**************************/
var buildStream = function(src) {
  // there are some things we can do before we diverge

  // protection from unhandled errors in plugins (ahem -- SASS!)
  src = src.pipe($.plumber(plumberErrorHandler));

  /***************
  JSHINT
  ****************/
  var filt = $.filter('**/*.js');
  var srcDir = path.join(__dirname, '..', h.src);
  src = src.pipe(filt)
    .pipe($.jshint(path.join(srcDir, '.jshintrc')))
    .pipe($.jshint.reporter('jshint-stylish'));
  // jscs can't handle lodash templates, so wait
  // .pipe($.jscs(path.join(srcDir, '.jscsrc')));
  src = src.pipe(filt.restore());

  /***************
  SASS
  ****************/
  var sassed = h.fs.src([path.join(h.src, '**/*.scss'), '!**/_*.scss']);
  sassed = sassed.pipe($.sass({
    sourceComments: 'map',
    includePaths: [bootstrapDir]
  }));
  src = merge(src, sassed);
  // filt = $.filter(['**/*.scss', '!**/_*.scss']);
  // src = src.pipe(filt);
  // src = src.pipe($.sass({
  //   sourceComments: 'map',
  //   includePaths: [bootstrapDir]
  // })).pipe(filt.restore().pipe($.filter('!**/*.scss')));

  var targets = $.branchClones({ src: src, targets: ['build', 'unit']});
  var build = targets['build'].pipe($.rebase(h.targets.build))
    .pipe($.plumber(plumberErrorHandler));
  var unit = targets['unit'].pipe($.rebase(h.targets.unit))
    .pipe($.plumber(plumberErrorHandler));
  // var dist = targets['dist'].pipe($.rebase(h.targets.dist));

  /****************
  TEMPLATE
  *****************/
  filt = $.filter(['**/*.html', '**/*.js']);
  build = build.pipe(filt)
    .pipe($.template(buildParams.build))
    .pipe(filt.restore());
  filt = $.filter(['**/*.html', '**/*.js']);
  unit = unit.pipe(filt)
    .pipe($.template(buildParams.unit))
    .pipe(filt.restore());
  // filt = $.filter(['**/*.html', '**/*.js']);
  // dist = dist.pipe(templateFilt)
  //   .pipe($.template(buildParams.dist))
  //   .pipe(templateFilt.restore());

  /***************
  JSCS -- just run it on build since we've branched
  ****************/
  filt = $.filter('**/*.js');
  srcDir = path.join(__dirname, '..', h.src);
  build = build.pipe(filt)
    .pipe($.jscs(path.join(srcDir, '.jscsrc')));
  build = build.pipe(filt.restore());

  /**************
  embed livereload script in build/index.html
  **************/
  filt = $.filter(path.join(h.targets.build, 'index.html'));
  build = build.pipe(filt)
    .pipe($.embedlr());
  build = build.pipe(filt.restore());

  var out = merge(build, unit);
  out = out.pipe(h.fs.dest('.'));

  // out.on('error', function(err) {
  //   $.util.log('caught error' + err);
  // });

  return out;

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
    .pipe($.mochaPhantomjs({reporter: 'dot'}))
    .on('error', function(){})
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

tasks['watch'] = {
  deps: ['build', 'unit'],
  func: function(cb) {
    activeServers = [];
    activeServers.push(startServer(h.targets.build, 3000));
    activeServers.push(startServer(h.targets.unit, 3001));
    amWatching = true;

    var watcher = $.watch({
      glob: path.join(h.src, '**/*'),
      name: 'watch',
      emitOnGlob: false,
      emit: 'one',
      silent: true
    }, function(file, gulpWatchCb) {
      file.pipe($.util.buffer(function(err, files) {

        var relpath = path.relative(
          path.join(__dirname, '../src'), files[0].path
        );
        $.util.log('[' + chalk.cyan('watch') + '] ' +
            chalk.bold.blue(relpath) + ' was ' + chalk.magenta(files[0].event));

        if (!(files[0].event === 'changed' || files[0].event === 'added')) {
          refireWatchTask();
        }
        else if (rebuildOnNext) {
          $.util.log('[' + chalk.cyan('watch') + '] ' +
              chalk.yellow(
                'some changes not written on previous change -- rebuilding'
              ));
          refireWatchTask();
        }
        else {
          files = readArray(files);

          var out = buildStream(files).pipe(
            $.util.buffer(function(err, files) {
              if(!rebuildOnNext) {
                h.fs.src(path.join(h.targets.unit, 'unit-runner.html'))
                .pipe($.mochaPhantomjs())
                .on('error', function(){})
                .pipe($.util.buffer(
                    function(err, files) {
                      writeWatchMenu();
                      gulpWatchCb();
                    }
                ));
              }
              else {
                // writeWatchMenu();
                gulpWatchCb();
              }
            })
          );
        }
      }));
    });
    activeServers.push(watcher);

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
      activeServers.push(watcher);
      activeServers.push(buildLr);

      writeWatchMenu();

      if (cb) {
        // if we restarted this function then no cb is available or
        // necessary
        cb();
      }

    });
  }
};
