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

// TODO dovs
//
module.exports = [{
  name: 'server-stress',
  deps: [],
  func: function (cb) {

    var request = require('request').defaults({ timeout: 10000 });

    var responseCount = 0;
    var successCount = 0;
    var errCount = 0;
    var simultaneous = 4;
    var repetitions = 26;
    var numTries = 0;
    var handleResponse = function (err, response, body) {
      responseCount++;
      console.log(responseCount);
      if (err) {
        errCount++;
        console.log('err');
      }
      else {
        successCount++;
        console.log('ok');
      }
      if (responseCount === simultaneous * repetitions) {
        console.log('successCount: ' + successCount, 'errCount: ' + errCount);
        cb();
      }
    };
    var makeRequest = function () {
      numTries++;
      request.post({
        uri: 'http://localhost:8090/v1/search',
        json: {
          query: {
            qtext: ''
          }
        }
      }, handleResponse);

      if (numTries === simultaneous * repetitions) {
        clearInterval(interval);
      }
    };

    var interval = setInterval(function () {
      for (var i = 0; i < simultaneous; i++) {
        makeRequest();
      }
    }, 500);

  }
}];
