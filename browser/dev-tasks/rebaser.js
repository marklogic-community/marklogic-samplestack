// TODO: docs

var path = require('path');
var util = require('gulp-util');
var through2 = require('through2');

module.exports = function (outFolder, opt) {
  if (typeof outFolder !== 'string') {
    throw new Error('Invalid output folder');
  }
  var defaultMode;

  // js hint doesn't like this arithmetic
  /* jshint ignore:start */
  defaultMode = 0777 & (~process.umask());
  /* jshint ignore:end */

  if (typeof opt === 'string') {
    throw new util.PluginError(
      'rebase', 'rebase got a string for opt parameter'
    );
  }

  if (!opt) {
    opt = {};
  }
  if (!opt.cwd) {
    opt.cwd = process.cwd();
  }
  if (typeof opt.mode === 'string') {
    opt.mode = parseInt(opt.mode, 8);
  }

  var cwd = path.resolve(opt.cwd);
  var basePath = path.resolve(cwd, outFolder);
  var folderMode = (opt.mode || defaultMode);

  var rebaseFile = function (file, enc, cb) {
    var writePath = path.resolve(basePath, file.relative);
    var writeFolder = path.dirname(writePath);

    if (typeof opt.mode !== 'undefined') {
      if (!file.stat) {
        file.stat = {};
      }
      file.stat.mode = opt.mode;
    }

    file.cwd = cwd;
    file.base = path.resolve(path.join(basePath, '..'));
    file.path = writePath;

    this.push(file);
    cb();
  };

  return through2.obj(rebaseFile);

};
