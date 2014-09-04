// TODO docs

var path = require('path');
var bowerFiles = require('main-bower-files');
var ctx = require('../context');
var helper = require('../helper');
var merge = require('event-stream').merge;

var bowerBuildStream = function (read) {
  return helper.fs.src(bowerFiles({
    includeDev: false,
    dependencies: false,
    read: read
  }), { base: path.join(ctx.paths.rootDir, 'bower_components') });
};

var bowerUnitStream = function (read) {
  return helper.fs.src(bowerFiles({
    includeDev: true,
    // debugging: true,
    dependencies: false,
    read: read
  }), { base: path.join(ctx.paths.rootDir, 'bower_components') });
};

// copy all of the bower components runtime deps to the build
// and unit targets.
// also, for unit targets, copy the dev dependencies that have
// an oerride that indicates they are needed for the unit target
//
module.exports = [{
  name: 'bower-files',
  deps: ['clean'],
  func: function () {
    var stream1 = bowerBuildStream(true)
      .pipe(helper.fs.dest(path.join(ctx.paths.buildDir, 'deps')));

    var stream2 = bowerUnitStream(true)
      .pipe(helper.fs.dest(path.join(ctx.paths.unitDir, 'deps')));

    return merge(stream1, stream2);
  }
}];
