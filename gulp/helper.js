/**
 * Provides configuration and utilities, such as commonly used paths, globs,
 * and functions that are reused throughout this module.
 * @type {Object}
 */
var helper = module.exports = {};

var path = require('path');
var _ = require('lodash');
var map = require('map-stream');
var duplex = require('duplexer');


/**
 * All dependency packages that match '^gulp-'.  Almost all of these
 * are gulp plugins or gulp "friendlies" from third parties.
 * @type {Object}
 */
var $ = require('gulp-load-plugins')({
  config: path.resolve(__dirname, '../package.json')
});

// add our yet-to-be-published, generic plugins
_.merge($, require('./plugins'));
// add our yet-to-be-published marklogic-specific plugins
/**
 * A set of plugins for working with MarkLogic in a Node development
 * environment.
 * @type {Object}
 */
$.marklogic = require('./gulp-marklogic');

/**
 * Expose all of the plugins
 * @type {Object}
 */
helper.$ = $;

var ignoreIncoming = function(outgoingStream) {
  var incomingStream = map(function(data, callback) {
    callback();
  });
  // the incoming stream is not connected to the outgoing stream
  return duplex(incomingStream, outgoingStream);
};

/**
 * TODO
 * @type {[type]}
 */
helper.buildParams = require('../buildParams');
// TODO -- absoluteize these?
helper.src = 'src';
/**
 * specific directories to which to write
 * @type {Object}
 */
helper.targets = {
  build: 'build',
  unit: 'unit',
  e2e: 'e2e',
  docs: 'docs',
  dist: 'dist'
};


var hidevfs = require('vinyl-fs');
var defaultFsOpts = { cwd: path.resolve(__dirname, '..') };

/**
 * Ensure we have the correct base (important if the process is running
 * in a different directory).  This wraps vinyl-fs.  Don't expose vinyl-fs
 * directly so that we don't slip and use it by mistake, thus working with
 * the wrong directory
 * @type {Object}
 */
helper.fs = {
  src: function(globs, opt) {
    return ignoreIncoming(hidevfs.src(globs, _.defaults(opt, defaultFsOpts)));
        // .pipe(plumber(function(err) {
        //   console.log('ERR! TODO: fix this message');
        //   console.log(err.stack);
        // }));
  },
  dest: function(folder, opt) {
    return hidevfs.dest(folder, _.defaults(opt, defaultFsOpts));
  },
  watch: function(globs, opt, cb) {
    return hidevfs.watch(globs, _.defaults(opt, defaultFsOpts), cb);
  }
};

