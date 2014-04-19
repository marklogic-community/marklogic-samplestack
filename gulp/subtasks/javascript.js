/**
 * organizes sass-related gulp object
 * @type {Object}
 */
var me = module.exports = {};
var lazypipe = require('lazypipe');
var h = require('../helper');
var $ = h.$;
/**
 * TODO
 * @type {Array}
 */
me.domain = ['**/*.js'];
// /**
//  * TODO
//  * @type {Array}
//  */
// me.focus = ['**/*.scss', '!**/_*.scss'];

// reuable lazypipe to do the actual build
var buildPipe = lazypipe()
  // TODO: need to branch here for build/unit
  // .pipe($.filter, me.focus)
  .pipe($.template, h.buildParams.build);

/**
 * TODO
 * @return {[type]} [description]
 */
me.preprocess = function() {
  return $.util.noop();
  // return h.pipewrap('javascript', 'preprocessing', me.domain, [
  //   [preprocessPipe]
  // ])
  // .pipe($.util.noop());
};

/**
 * TODO
 * @return {[type]} [description]
 */
me.build = function() {
  return h.pipewrap('javascript', 'building', me.domain, [
    [buildPipe],
    [h.fs.dest, h.targets.unit],
    [h.fs.dest, h.targets.build]
  ]);
  // $.tasklog('js', 'building');
  // return $.if(me.domain, lazypipe()
  //     .pipe(buildPipe)
  //     .pipe(h.fs.dest, h.targets.unit)
  //     .pipe(h.fs.dest, h.targets.build)()
  // );
};
