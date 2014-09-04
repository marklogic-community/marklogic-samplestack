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
var buildParams = ctx.buildParams;
var buildSteps = require('./buildSteps');

var rebaser = require('../rebaser');
var cloner = require('../cloner');
var counter = require('../counter');

module.exports = function (stream) {
  ctx.hadErrors = false;

  // plumb the entire stream with an error handler (see gulp-plumber)
  stream = stream.pipe($.plumber(ctx.errorHandler));

  stream = stream.pipe(counter());

  // rearrange the paths used to represent the files during this function's
  // processing

  stream = stream.pipe($.if(['**/src/**'], rebaser('src')));
  stream = stream.pipe($.if(['**/test/unit-tests/**'], rebaser('unit')));

  // now we can execute the steps that we want done once on the entire set
  // of files

  stream = buildSteps.linters(stream);
  stream = buildSteps.browserify(stream);
  stream = buildSteps.sass(stream);

  // now we want the src and unit directories separated into diferent streams
  // so that we can diverge their handling. We also need the unit dir to
  // contain what is in src so that we can merge it into unit (so that the unit
  // tests have something to test!).
  var doClone = cloner();
  stream = stream.pipe($.if(ctx.paths.srcPattern, doClone));
  var srcStream = doClone.cloned;
  srcStream = srcStream.pipe($.tap(
    function (file) {
      file.path = file.path.replace(/src\//, '');
    }
  ));
  srcStream = srcStream.pipe(rebaser(ctx.paths.buildDir));

  srcStream = buildSteps.embedLr(srcStream);

  var unitStream = stream;
  unitStream = unitStream.pipe($.tap(
    function (file) {
      file.path = file.path.replace(/src\//, '');
      file.path = file.path.replace(/unit\//, '');
    }
  ));
  unitStream = unitStream.pipe(rebaser(ctx.paths.unitDir));

  srcStream = buildSteps.applyTemplateParams(srcStream, buildParams.build);
  unitStream = buildSteps.applyTemplateParams(unitStream, buildParams.unit);

  // now that files are rearranged and template parameters have been applied,
  // merge them back together
  // stream = multistream.obj([unitStream, srcStream]);
  stream = merge(unitStream, srcStream);

  // // set a backstop on the entire stream
  // stream.on('error', function (err) {
  //   $.util.log(err);
  //   $.util.beep();
  // });

  // write out the files excluding deadweight directories
  return stream
    .pipe(helper.fs.dest(ctx.paths.buildsRoot));
};
