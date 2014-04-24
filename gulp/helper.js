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
var lazypipe = require('lazypipe');
var chalk = require('chalk');


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
$.callback = require('callback-stream');
$.tasklog = function(task, message) {
  $.util.log('[' + chalk.cyan(task) + ']', message);
};
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

helper.pipewrap = function(task, step, domain, lazySteps) {
  // if a file matches the domain
  return $.if(domain, (function() {
    // then it enters this stream
    // $.tasklog(task, step); // we've entered the stream, so ay somthing nice
    var lp = lazypipe(); // initialize a lazypipe
    var movingStep = lp; // keep track of the steps we add to the LP
    _.forEach(lazySteps, function(lazyStep) {
      console.log('step');
      // loop over the step to add
      // apply the contents of the lazyStep array to the LP pipe function
      movingStep = movingStep.pipe.apply(movingStep, lazyStep);
    });
    // invoke and return the stream back to the $.if branch
    return movingStep();
  })());
  // pipe to noop to colect the files back from the $.if branch
  // .pipe($.debug({title: 'testy'}));
  // util.noop());
};

/**
 * TODO
 * @type {[type]}
 */
helper.buildParams = require('../buildParams');

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


/**
 * context-specific subdirectories
 * @type {Object}
 */
helper.subdirs = {
};


/**
 * TODO
 * @param {Object} params TODO -- pipe should be an **unbuilt** lazypipe, not
 * a built one.
 * @return {Object} Should be either a stream or a promise.  This means that
 * the end of th lazypipe can return a stream or a promise.
 */
helper.setWatch = function(params) {
  return $.watch({
    glob: params.watch,
    name: params.name,
    emitOnGlob: false,
    emit: 'one'
  }, function(file) {
    return file.pipe(params.pipe()());
  });
};
