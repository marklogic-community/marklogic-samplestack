// TODO: docs

var path = require('path');
var _ = require('lodash');
var map = require('map-stream');
var duplex = require('duplexer');
var vfs = require('vinyl-fs');

// TODO: get the paths out of here
var defaultBrowserFsOpts = {
  cwd: path.resolve(__dirname, '../../../browser')
};
var ignoreIncoming = function (outgoingStream) {
  var incomingStream = map(function (data, callback) {
    callback();
  });
  // the incoming stream is not connected to the outgoing stream
  return duplex(incomingStream, outgoingStream);
};

module.exports = {
  $: require('gulp-load-plugins')({
    config: path.resolve(__dirname, '../../../package.json')
  }),

  /**
   * Ensure we have the correct base (important if the process is running
   * in a different directory).  This wraps vinyl-fs.  Don't expose vinyl-fs
   * directly so that we don't slip and use it by mistake, thus working with
   * the wrong directory
   * @type {Object}
   */
  browser: {
    fs: {
      src: function (globs, opt) {
        return ignoreIncoming(
          vfs.src(globs, _.defaults(opt, defaultBrowserFsOpts))
        );
      },
      dest: function (folder, opt) {
        return vfs.dest(folder, _.defaults(opt, defaultBrowserFsOpts));
      },
      watch: function (globs, opt, cb) {
        return vfs.watch(globs, _.defaults(opt, defaultBrowserFsOpts), cb);
      }
    }
  }
};
