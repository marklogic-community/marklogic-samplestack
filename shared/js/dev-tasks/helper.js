/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
