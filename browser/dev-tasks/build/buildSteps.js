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
var buildParams = ctx.buildParams;

var srcDir = path.join(ctx.paths.rootDir, ctx.paths.src);

// gulp-if and  lazypipe are used together to create "on-the-fly" plugins
// that are conditionally run on files that match given criteria

module.exports = {

  // see gulp-jshint and gulp-jscs
  linters: function (stream) {
    // do not lint browserified files
    stream = stream.pipe($.if(
      [ctx.paths.srcPattern + '.js', '!**/*.browserify.*'],
      lazypipe()
        .pipe($.jshint, path.join(ctx.paths.srcDir, '.jshintrc'))
        .pipe($.jshint.reporter, 'jshint-stylish')
        .pipe($.jshint.reporter, 'fail')
        .pipe($.jscs, path.join(ctx.paths.rootDir, '.jscsrc'))()
        .on('error', ctx.errorHandler)

    ));
    stream.on('error', ctx.errorHandler);
    stream = stream.pipe($.if(
      [ctx.paths.unitPattern + '.js', '!**/*.browserify.*'],
      lazypipe()
        .pipe($.jshint, path.join(ctx.paths.unitSrcDir, '.jshintrc'))
        .pipe($.jshint.reporter, 'jshint-stylish')
        .pipe($.jshint.reporter, 'fail')
        .pipe($.jscs, path.join(ctx.paths.rootDir, '.jscsrc'))()
        .on('error', ctx.errorHandler)
    ));
    stream.on('error', ctx.errorHandler);
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

    var rubySassCheck = function () {
      var which = require('shelljs').which;

      if (!which('sass') || !which('ruby')) {
        $.util.log('[' + chalk.cyan('build') + '] ' +
          chalk.yellow('ruby-sass') +
          ' configured but ' + chalk.red('ruby and/or ruby-sass not found'));
        $.util.log('[' + chalk.cyan('build') + '] ' +
          chalk.yellow('falling back to ') + chalk.green('node-sass-safe') +
          ' (which does not require sass)');

        buildParams.sassCompiler = 'node-sass-safe';
        return false;
      }
      else {
        return true;
      }
    };

    var importDirs =
        ['bower_components/bootstrap-sass-official/assets/stylesheets'];

    // TODO: considering using bourbon instead of bootstrap
    // var importDirs = [
    //   'bower_components/bourbon/dist',
    //   'bower_components/bitters/app/assets/stylesheets',
    //   'bower_components/neat/app/assets/stylesheets'
    // ];

    var sassPipe;
    var sassParams;

    // if the build is configured to use RUBY sass instead of NODE sass
    if (buildParams.sassCompiler === 'ruby-sass') {
      if (rubySassCheck()) {

        sassParams = {
          sourcemap: true,
          sourcemapPath: '.',
          loadPath: importDirs
        };

        var sourcesPaths = [path.join(srcDir, '**/*.scss')].concat(
          importDirs.map(function (dir) {
            return path.join(dir, '**/*.scss');
          })
        );

        sassPipe = lazypipe()
          // we grab the files from a higher base because we need to get
          // into the bower_components directory
          .pipe(helper.fs.src, sourcesPaths, { base: helper.rootDir })
          .pipe($.rubySass, sassParams);

        return stream.pipe(
          // ruby-sass has some issues with error handling so the best we can
          // do is let it report them and swallow them.  TODO: This needs to be
          // revisited if we continue to offer ruby-sass as an option
          $.if('**/*.scss', sassPipe().on('error', ctx.errorHandler))
        );

      }
      else {
        // TODO: what do we do -- throw an error?
        throw new Error('You must fix the SASS configuration.');
      }
    }
    else {

      // default is NODE sass (order of magnitude faster than ruby sass,
      // though less stable and not completely up to date, hence the ruby sass
      // option for those who prefer or need it
      sassParams = {
        includePaths: importDirs,
        onError: ctx.errorHandler
      };

      if (buildParams.sassCompiler !== 'node-sass-safe' &&
          process.platform !== 'win32'
      ) {
        // TODO these params might cause node-sass to SEGFAULT on ScSS syntax
        // errors.
        // will be fixed when https://github.com/sass/node-sass/pull/366
        // is merged
        sassParams.sourceComments = 'map';
        sassParams.sourceMap = '';
      }

      sassPipe = lazypipe()
        .pipe(helper.fs.src, path.join(srcDir, '**/*.scss'))
        .pipe($.sass, sassParams)
        .pipe($.tap, function (file) {
          file.base = file.base.replace(/\/src/, '');
        });

      return stream.pipe($.if('**/*.scss', sassPipe()));
    }

  },

  embedLr: function (stream) {
    return stream.pipe($.if(
      path.join(ctx.paths.buildDir, 'index.html'),
      $.embedlr()
    ));
  },

  applyTemplateParams: function (stream, params) {
    return stream.pipe($.if(
      ['**/*.html', '**/*.js'],
      $.template(params)
    ));
  }
};
