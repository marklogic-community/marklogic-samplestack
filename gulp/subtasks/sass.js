/**
 * organizes sass-related gulp object
 * @type {Object}
 */
var me = module.exports = {};
var lazypipe = require('lazypipe');
var h = require('../helper');
var $ = h.$;
var bootstrapDir =
    'bower_components/bootstrap-sass-official/vendor/assets/stylesheets';

/**
 * TODO
 * @type {Array}
 */
me.domain = ['**/*.scss'];
/**
 * TODO
 * @type {Array}
 */
me.focus = ['**/*.scss', '!**/_*.scss'];


// reuable lazypipe to do the actual build
var buildPipe = lazypipe()
  .pipe($.filter, me.focus)
  .pipe($.sass, {
    sourceComments: 'map',
    includePaths: [bootstrapDir]
  });

/**
 * TODO
 * @return {[type]} [description]
 */
me.preprocess = function() {
  return $.util.noop();
  // return h.pipewrap('sass', 'preprocessing', me.domain, [
  //   [preprocessPipe]
  // ])
  // .pipe($.util.noop());
  // return h.pipewrap('sass', 'validating', me.domain, [
  //   [$.util.noop]
  // ]).pipe($.util.noop());
  // return $.if(me.domain, (function() {
  //   $.tasklog('sass', 'validating');
  //   return lazypipe().pipe($.util.noop)();
  // })())
  // .pipe($.util.noop());
};

/**
 * TODO
 * @return {[type]} [description]
 */
me.build = function() {
  return h.pipewrap('sass', 'building', me.domain, [
    [buildPipe],
    [h.fs.dest, h.targets.unit],
    [h.fs.dest, h.targets.build]
  ]);
  // return $.if(me.domain, (function() {
  //   $.tasklog('sass', 'building');
  //   return lazypipe()
  //     .pipe(buildPipe)
  //     .pipe(h.fs.dest, h.targets.unit)
  //     .pipe(h.fs.dest, h.targets.build)();
  // })());
};
