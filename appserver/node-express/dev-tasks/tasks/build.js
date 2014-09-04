// TODO docs

var path = require('path');

var runBuild = require('../build/runBuild');
var ctx = require('../context');
var helper = require('../helper');

module.exports = [{
  name: 'build',
  // deps: ['clean', 'bower-files'],
  func: function () {
    var srcs = helper.fs.src([
      path.join(ctx.paths.libDir, '**/*'),
      path.join(ctx.paths.unitDir, '**/*'),
    ]);

    return runBuild(srcs);

  }
}];
