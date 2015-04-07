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

var through2 = require('through2');
var helper = require('./helper');

module.exports = function () {
  var count = 0;
  return through2.obj(
    function (file, enc, cb) {
      if (count === 0) {
        helper.$.util.log('processing files');
      }
      count++;
      this.push(file);
      cb();
    },
    function (cb) {
      helper.$.util.log('saw ' + count + ' files');
      cb();
    }
  );
};
