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

// lazypipe is used to create objects that actd as on-the-fly-created plugins
// which combine several plugins.  This allows us to conditionally execute
// a set of plugins, usually based on path match
var lazypipe = require('lazypipe');

// ability to use node modules in the browser
// vinyl-buffer converts file.contents from streams to buffers
// (and is used after browserify)
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var chalk = require('chalk');

var helper = require('../helper');

// make it easier to get to plugins
var $ = helper.$;
var ctx = require('../context');
var options = ctx.options;

var srcDir = path.join(ctx.paths.browser.rootDir, ctx.paths.browser.src);

// gulp-if and  lazypipe are used together to create "on-the-fly" plugins
// that are conditionally run on files that match given criteria

module.exports = {

  // see gulp-jshint and gulp-jscs
  linters: function (stream) {
    // do not lint browserified files

    var filt1 = $.filter(['src/**/*.js', '!**/*.browserify.*']);
    stream = stream
    .pipe(filt1)
    .pipe($.jshint(path.join(ctx.paths.browser.srcDir, '.jshintrc')))
    .pipe($.jshint.reporter('jshint-stylish'));
    // .pipe($.jshint.reporter('fail'))
    // .pipe($.jscs(path.join(ctx.paths.browser.rootDir, '.jscsrc')));
    stream = stream.pipe(filt1.restore());

    var filt2 = $.filter(['test/unit-tests/**/*.js', '!**/*.browserify.*']);
    stream = stream
    .pipe(filt2)
    .pipe($.jshint(path.join(ctx.paths.browser.unitSrcDir, '.jshintrc')))
    .pipe($.jshint.reporter('jshint-stylish'));
    // .pipe($.jshint.reporter('fail'))
    // .pipe($.jscs(path.join(ctx.paths.browser.rootDir, '.jscsrc')));
    stream = stream.pipe(filt2.restore());
    return stream;
  },

  // see browserify, gulp-tap, buffer
  browserify: function (stream) {
    return stream.pipe($.if(
      function (file) {
        // files to be browserified should have browserify in their name
        return file.path.indexOf('browserify') >= 0;
      },
      lazypipe()
        // tap allows us to get at individual files in the stream
        .pipe($.tap, function (file) {
          // de-nodififies a file and assigns the result as a stream
          file.contents = browserify({ entries: [ file.path ] }).bundle();
        })
        // browserify returns a stream of content rather than a buffer,
        // so vinyl-buffer lets us read the stream back into a buffer
        // so most of the rest of the plugins don't choke
        .pipe(buffer)()
    ));
  },

  sass: function (stream) {

    var importDirs = [
      'browser/bower_components/bootstrap-sass/assets/stylesheets'
    ];

    // TODO: considering using bourbon instead of bootstrap
    // var importDirs = [
    //   'bower_components/bourbon/dist',
    //   'bower_components/bitters/app/assets/stylesheets',
    //   'bower_components/neat/app/assets/stylesheets'
    // ];

    var sassPipe;
    var sassParams;

    sassParams = {
      includePaths: importDirs,
      onError: ctx.errorHandler,
      sourceMap: true
    };

    sassPipe = lazypipe()
      // get a clean stream of scss files properly based
      .pipe(
        helper.browser.fs.src,
        path.relative(ctx.paths.projectRoot, path.join(srcDir, '**/*.scss'))
      )
      // adjust the base now, so that when the resulting files are joined with the main stream,
      // their paths match
      .pipe($.tap, function (file) {
        file.base = file.base.replace(/[\/\\]src/, '');
      })
      .pipe($.sourcemaps.init)
      .pipe($.sass, sassParams)
      .pipe(
        $.sourcemaps.write,
        '.',
        { includeContent: true, sourceRoot: '/' }
      );

    var result = stream.pipe($.if('**/*.scss', sassPipe()));
    return result;
  },

  embedLr: function (stream, port) {
    return stream.pipe($.if(
      path.join(ctx.paths.browser.buildDir, 'index.html'),
      $.embedlr({ port: port })
    ));
  },

  applyTemplateParams: function (stream, params) {
    return stream.pipe($.if(
      ['**/*.html', '**/*.js'],
      $.template(params)
    ));
  }
};
