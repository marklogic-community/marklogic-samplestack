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

var chalk = require('chalk');

var logError = function (message) {
  console.log(chalk.red('ERROR!'));
  console.log(message);
};

module.exports = {
  error: function (status, error) {
    if (error.stack) {
      logError(error.stack);
    }
    else {
      logError(JSON.stringify(error, null, ' '));
    }
  }
};
