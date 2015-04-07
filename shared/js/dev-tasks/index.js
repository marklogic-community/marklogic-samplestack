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

var tasks = module.exports = {};
//
var fs = require('fs');
var path = require('path');

var ctx = require('./context');

module.exports = fs.readdirSync(path.join(__dirname, 'tasks')).reduce(
  function (acc, modPath) {
    var modName = path.basename(modPath).replace(/\.js/, '');
    var mod = require('./tasks/' + modName);
    mod.forEach(function (taskObj) {
      acc[taskObj.name] = taskObj;
    });
    return acc;
  },
  {}
);
