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
var _ = require('lodash');
var uuid = require('node-uuid');

var generateUUID = function () {
  return uuid.v4();
};

var questionTemplate = {
  'accepted':false,
  'acceptedAnswerId':null,
  'answerCount':0,
  'answers':[],
  'comments':[],
  'creationDate':new Date(),
  'id':'',
  'itemTally':0,
  'lastActivityDate':new Date(),
  /* TODO: Need to generate this piece somehow */
  'owner':{
    'id':'cf99542d-f024-4478-a6dc-7e723a51b040',
    'displayName':'JoeUser',
    'userName':'joe@example.com'
  },
  'voteCount':0,
  'upvotingContributorIds':[],
  'downvotingContributorIds':[]
};

module.exports = function (userSpec) {
  var self = this;

  return new Promise(function (resolve, reject) {
    var id = generateUUID();
    var questionURI = '/questions/' + id + '.json';
    var questionContent = _.clone(questionTemplate);
    questionContent.id = id;
    console.log(userSpec);
    _.merge(questionContent, userSpec);

    var fetch = self.documents.write(
      { uri: questionURI,
        contentType: 'application/json',
        content: questionContent
      }
    );
    fetch.result(
      function (response) {
        if (response.documents.length !== 1) {
          return reject({
            error: 'cardinalityViolation',
            userSpec: userSpec,
            count: response.documents.length
          });
        }
        return resolve(questionContent);
      },
      reject
    );
  });
};
