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
    };

    ctx.built = false;
    var srcs = helper.browser.fs.src([
      path.join(ctx.paths.browser.srcDir, '**/*'),
      path.join(ctx.paths.browser.unitSrcDir, '**/*'),
    ]);

    var final = runBuild(srcs);
    final.on('end', finalize);
    final.on('close', finalize);
    return final;
  }
}];
