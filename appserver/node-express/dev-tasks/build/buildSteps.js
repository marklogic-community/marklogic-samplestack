var path = require('path');

// lazypipe is used to create objects that actd as on-the-fly-created plugins
// which combine several plugins.  This allows us to conditionally execute
// a set of plugins, usually based on path match
var lazypipe = require('lazypipe');

// ability to use node modules in the browser
// vinyl-buffer converts file.contents from streams to buffers
// (and is used after browserify)
// var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var chalk = require('chalk');

var helper = require('../helper');

// make it easier to get to plugins
var $ = helper.$;
var ctx = require('../context');
// var buildParams = ctx.buildParams;

var libDir = path.join(ctx.paths.rootDir, ctx.paths.lib);

// gulp-if and  lazypipe are used together to create "on-the-fly" plugins
// that are conditionally run on files that match given criteria

module.exports = {

  // see gulp-jshint and gulp-jscs
  linters: function (stream) {
    // do not lint browserified files
    stream = stream.pipe($.if(
      [ctx.paths.libPattern + '.js'],
      lazypipe()
        .pipe($.jshint, path.join(ctx.paths.rootDir, '.jshintrc'))
        .pipe($.jshint.reporter, 'jshint-stylish')
        .pipe($.jshint.reporter, 'fail')
        .pipe($.jscs, path.join(ctx.paths.rootDir, '.jscsrc'))()
        .on('error', ctx.errorHandler)

    ));
    stream.on('error', ctx.errorHandler);
    return stream;
  }

};
