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

module.exports = function (uid) {
  var self = this;
  return new Promise(function (resolve, reject) {

    var roles = [];
    var filter = '(&(objectclass=groupOfNames)(uniqueMember=uid=' +
        uid +
        ',ou=people,dc=samplestack,dc=org))';
    return self.search(
      'dc=samplestack,dc=org',
      {
        filter: filter,
        attributes: ['cn'],
      },
      function (err, response) {
        if (err) {
          return reject(err);
        }
        else {
          response.on('error', function (err) {
            return reject(err);
          });

          response.on('searchReference', function (referral) {
            return reject(new Error(
              'LDAP search reference returned -- not implemented'
            ));
          });

          response.on('searchEntry', function (entry) {
            roles.push(entry.object.cn);
          });

          response.on('end', function () {
            return resolve(roles);
          });
        }
      }
    );
  });
};
