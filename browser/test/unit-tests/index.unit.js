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

define([
  '_marklogic/index.unit',
  'app/index.unit',
  'testHelper'
], function (
  marklogic,
  app,
  helper
) {
  describe('unit tests', function () {

    marklogic();
    app();


    after(function (done) {
      this.timeout = 8000;

      if (window.__coverage__) {
        helper.postCoverage(window.__coverage__, done);
      }
      else {
        done();
      }
    });
  });
});
