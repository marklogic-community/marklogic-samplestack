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

var version = function () {
  var matched = process.version.match(/^v(\d+)\.(\d+)\.(\d+)$/);
  return {
    major: parseInt(matched[1]),
    minor: parseInt(matched[2]),
    revision: parseInt(matched[3])
  };
};

var v = version();

if (!v.major && (v.minor !== 10 || v.revision < 20)) {
  process.stderr.write(
    'Unsupported Node.js version (' + process.version + ').\n\n' +
        'Please install a recent release of Node.js 0.10.x ()'
  );
  process.exit(1);
}
