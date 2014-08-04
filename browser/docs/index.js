var gulp = require('gulp');
var concat = require('gulp-concat');
var dgeni = require('dgeni');
var merge = require('event-stream').merge;
var path = require('canonical-path');

var outputFolder = path.resolve(__dirname, '../builds/docs');
var bowerFolder = 'bower_components';

var copyComponent = function (component, pattern, sourceFolder, packageFile) {
  pattern = pattern || '/**/*';
  sourceFolder = sourceFolder || bowerFolder;
  packageFile = packageFile || 'bower.json';
  var version = require(path.resolve(sourceFolder,component,packageFile)).version;
  return gulp
    .src(sourceFolder + '/' + component + pattern)
    .pipe(gulp.dest(outputFolder + '/components/' + component + '-' + version));
};

var docsBuildApp = function (cb) {
  gulp.src('docs/app/src/**/*.js')
    .pipe(concat('docs.js'))
    .pipe(gulp.dest(outputFolder + '/js/'))
    .on('end', cb);
};

var docsAssets = function (cb) {
  merge(
    gulp.src(['docs/app/assets/**/*']).pipe(gulp.dest(outputFolder)),
    copyComponent('bootstrap', '/dist/**/*'),
    copyComponent('open-sans-fontface'),
    copyComponent('lunr.js','/*.js'),
    copyComponent('google-code-prettify'),
    copyComponent('jquery', '/jquery.*'),
    copyComponent('marked', '/**/*.js', 'node_modules', 'package.json')
  ).on('end', cb);
};

var docsGen = function (config, cb) {
  dgeni.generator(config)().then(
    cb,
    cb
  );
};

var dgeniConfig;
module.exports = {
  prepare: function (cb) {
    dgeniConfig = dgeni.loadConfig('docs/docs.config.js');
    return docsAssets(function () {
      docsBuildApp(cb);
    });
  },
  generate: function (cb) {
    gulp.src(['docs/app/assets/**/*']).pipe(gulp.dest(outputFolder))
    .on('end', function () {
      docsGen(dgeniConfig, function () {
        cb();
      });
    });
  }
};
