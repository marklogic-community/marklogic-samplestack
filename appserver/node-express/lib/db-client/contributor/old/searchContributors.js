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

var Promise = require('bluebird');
var qb = require('marklogic').queryBuilder;

module.exports = function (userSpec) {
  var self = this;

  return new Promise(function (resolve, reject) {

    var contributorsDir = 'com.marklogic.samplestack.domain.Contributor/';
    var length = 10;
    var start = (userSpec.start) ? userSpec.start : 1;
    var searchText = (userSpec.q) ? userSpec.q : '';
    var fetch = self.documents.query(
      qb.where(
        qb.directory(contributorsDir),
        qb.parsedFrom(searchText)
      ).slice(start,length).withOptions({categories: 'none'})
    );
    fetch.result(
      function (response) {
        if (response.length !== 1) {
          return reject({
            error: 'cardinalityViolation',
            userSpec: userSpec,
            count: response.length
          });
        }
        return resolve(response);
      },
      reject
    );
  });
};
