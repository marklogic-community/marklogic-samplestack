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
    // TODO: should thie really be approx. 2-times slower? are we missing
    // an index?
    // self.documents.query(
    //   qb.where(
    //     qb.directory('com.marklogic.samplestack.domain.Contributor/'),
    //     qb.value('id', userId)
    //   )
    // ).result(
    //
    var fetch;

    if (userSpec.contributorId) {
      fetch = self.documents.read(
        'com.marklogic.samplestack.domain.Contributor/' +
            userSpec.contributorId +
            '.json'
      );
    }
    else {
      fetch = self.documents.query(
        qb.where(
          qb.directory('com.marklogic.samplestack.domain.Contributor/'),
          qb.value('userName', userSpec.uid)
        )
      );
    }
    fetch.result(
      function (response) {
        if (response.length !== 1) {
          return reject({
            error: 'cardinalityViolation',
            userSpec: userSpec,
            count: response.length
          });
        }
        var obj = response[0].content[
          Object.keys(response[0].content)[0]
        ];
        // TODO: how do we handle this now?
        // obj.votes = obj.votes[Object.keys(obj.votes)[0]];
        return resolve(obj);
      },
      reject
    );
  });
};
