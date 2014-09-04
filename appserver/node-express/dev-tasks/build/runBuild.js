// TODO docs

/*************************
this is the main building
function for builds and
incremental watch buils

stream should be the combination of sources from which we are based (from
a path perspective) on their original location.
**************************/

// lazypipe is used to create objects that actd as on-the-fly-created plugins
// which combine several plugins.  This allows us to conditionally execute
// a set of plugins, usually based on path match
var path = require('path');
var merge = require('event-stream').merge;

var helper = require('../helper');

// make it easier to get to plugins
var $ = helper.$;

var ctx = require('../context');
// var buildParams = ctx.buildParams;
var buildSteps = require('./buildSteps');

// var rebaser = require('../rebaser');
// var cloner = require('../cloner');
var counter = require('../counter');

module.exports = function (stream) {
  ctx.hadErrors = false;

  // plumb the entire stream with an error handler (see gulp-plumber)
  stream = stream.pipe($.plumber(ctx.errorHandler));

  stream = stream.pipe(counter());

  // rearrange the paths used to represent the files during this function's
  // processing

  stream = buildSteps.linters(stream);

  return stream;
};
