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
