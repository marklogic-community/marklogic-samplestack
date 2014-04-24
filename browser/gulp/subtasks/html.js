/**
 * organizes sass-related gulp object
 * @type {Object}
 */
var me = module.exports = {};
var lazypipe = require('lazypipe');
var h = require('../helper');
var $ = h.$;
var buildParams = require('../../buildParams');
/**
 * TODO
 * @type {Array}
 */
me.domain = ['**/*.html'];
// /**
//  * TODO
//  * @type {Array}
//  */
// me.focus = ['**/*.scss', '!**/_*.scss'];

/**
 * TODO
 * @return {[type]} [description]
 */
me.preprocess = function() {
  return $.util.noop();
};

// reuable lazypipe to do the actual build
var buildPipe = lazypipe()
  // .pipe($.filter, me.focus)
  .pipe($.template, buildParams.build);

/**
 * TODO
 * @return {[type]} [description]
 */
me.build = function() {
  return h.pipewrap('html', 'building', me.domain, [
    [buildPipe],
    [h.fs.dest, h.targets.unit],
    [h.fs.dest, h.targets.build]
  ]);
};
