// TODO: docs

// TODO: !**/*.md is not protecting markdown files from being deleted!!!
// del bug?

var path = require('path');
var ctx = require('../context');

module.exports = [{
  name: 'clean',
  deps: [],
  func: function (cb) {
    var bRootAll = path.join(ctx.paths.buildsRoot, '**/*');
    var not = '!' + path.join(ctx.paths.buildsRoot, '**/*.md');
    require('del')([bRootAll, not], { force: true }, cb);
  }
}];
