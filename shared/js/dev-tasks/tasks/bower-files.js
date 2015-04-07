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

// TODO docs

var path = require('path');
var bowerFiles = require('main-bower-files');
var ctx = require('../context');
var helper = require('../helper');
var merge = require('event-stream').merge;

var paths = {
  bowerJson: path.join(ctx.paths.browser.rootDir, 'bower.json'),
  bowerDirectory: path.join(ctx.paths.browser.rootDir, 'bower_components')
};

var bowerBuildStream = function (read) {
  return helper.browser.fs.src(
    bowerFiles({
      includeDev: false,
      dependencies: false,
      read: read,
      paths: paths
    }), { base: paths.bowerDirectory });
};

// TODO: use bower lib instead of making developer install/interact with it
// separately.
// `gulp bower` to fully address the situation (wipe out and install latest)
var bowerUnitStream = function (read) {
  return helper.browser.fs.src(
    bowerFiles({
      includeDev: true,
      // debugging: true,
      dependencies: false,
      read: read,
      paths: paths
    }), { base: paths.bowerDirectory });
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
      .pipe(helper.browser.fs.dest(
        path.join(ctx.paths.browser.buildDir, 'deps')
      ));

    var stream2 = bowerUnitStream(true)
      .pipe(helper.browser.fs.dest(
        path.join(ctx.paths.browser.unitDir, 'deps')
      ));

    return merge(stream1, stream2);
  }
}];
