// TODO docs

var path = require('path');

var runBuild = require('../build/runBuild');
var ctx = require('../context');
var helper = require('../helper');

module.exports = [{
  name: 'build',
  deps: ['clean', 'bower-files'],
  func: function () {
    var finalize = function () {
      ctx.build = true;

      ctx.deployBuilt();
    };

    ctx.built = false;
    var srcs = helper.fs.src([
      path.join(ctx.paths.srcDir, '**/*'),
      path.join(ctx.paths.unitSrcDir, '**/*'),
    ]);

    var final = runBuild(srcs);
    final.on('end', finalize);
    final.on('close', finalize);
    return final;
  }
}];
