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
var options = ctx.options;
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


  stream = stream.pipe($.if(['**/browser/src/**'], rebaser('browser/src')));

  stream = stream.pipe(
    $.if(['**/browser/test/unit-tests/**'], rebaser('browser/unit'))
  );

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
  stream = stream.pipe($.if(ctx.paths.browser.srcPattern, doClone));
  var srcStream = doClone.cloned;
  srcStream = srcStream.pipe($.tap(
    function (file) {
      file.path = file.path.replace(/src[\/\\]/, '');
    }
  ));
  srcStream = srcStream.pipe(rebaser(ctx.paths.browser.buildDir));

  srcStream = buildSteps.embedLr(srcStream, ctx.options.liveReloadPorts.webApp);

  var unitStream = stream;
  unitStream = unitStream.pipe($.tap(
    function (file) {
      file.path = file.path.replace(/src[\/\\]/, '');
      file.path = file.path.replace(/unit[\/\\]/, '');
    }
  ));
  unitStream = unitStream.pipe(rebaser(ctx.paths.browser.unitDir));

  srcStream = buildSteps.applyTemplateParams(
    srcStream, { options: options }
  );
  unitStream = buildSteps.applyTemplateParams(
    unitStream, { options: options.envs.unit }
  );

  // now that files are rearranged and template parameters have been applied,
  // merge them back together
  stream = merge(unitStream, srcStream);

  // write out the files excluding deadweight directories
  return stream
    .pipe(helper.browser.fs.dest(ctx.paths.browser.buildsRoot));
};
