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
var mlclient = require('marklogic');
var qb = mlclient.queryBuilder;
var pb = mlclient.patchBuilder;
var _ = require('lodash');
var uuid = require('node-uuid');

var db;
var questionsDir = '/questions/';
var contributorPrefix = 'com.marklogic.samplestack.domain.Contributor';
var contributorDir = contributorPrefix + '/';
// TODO: pull contributor info from session
var contributorId = 'cf99542d-f024-4478-a6dc-7e723a51b040';
var contributorDisplayName = 'JoeUser';
var contributorUserName = 'joe@example.com';

var commentTemplate = {
  'owner': {
    'id': contributorId,
    'displayName': contributorDisplayName,
    'userName': contributorUserName
  },
  'text': '',
};

var answerTemplate = {
  'text': '',
  'itemTally': 0,
  'comments': [],
  'owner': {
    'id': contributorId,
    'displayName': contributorDisplayName,
    'userName': contributorUserName
  },
  'upvotingContributorIds': [],
  'downvotingContributorIds': []
};


/*
 * UTILS
 */
var generateUUID = function () {
  return uuid.v4();
};

var readDocument = function (uri) {
  return new Promise(function (resolve, reject) {
    db.documents.read(uri).result(
      function (response) {
        return resolve(response[0].content);
      },reject
    );
  });
};

/*
 * REPUTATION CHANGE - SIDE EFFECT
 *
 * the author of the content (question or answer)
 * gets a repution bump or loses reputation
 */
var reputationChange = function (ownerID, repChange) {
  var authorURI = contributorDir + ownerID + '.json';
  return new Promise(function (resolve, reject) {
    var result = readDocument(authorURI);
    result.then(function (aDoc) {
      aDoc = aDoc[contributorPrefix];
      var newReputation = aDoc.reputation + repChange;
      db.documents.patch(
        authorURI,
        pb.replace('reputation', newReputation)
      ).result(
        function (response) {
          if (response.uri) {
            return resolve(readDocument(response.uri));
          }
        },reject
      );
    });
  });
};

/*
 * VOTING ON A QUESTION
 */
var handleQuestionVote = function (userSpec) {
  var questionId = userSpec.questionId;
  var upDown = userSpec.body.upDown;
  var questionURI = questionsDir + questionId + '.json';

  return new Promise(function (resolve, reject) {

    var result = readDocument(questionURI);
    result.then(function (qDoc) {
      var qOwnerID = qDoc.owner.id;
      var newVoteCount = qDoc.voteCount + 1;
      var newItemTally = qDoc.itemTally + upDown;
      var contribTypeToStore = (upDown === 1) ?
            'upvotingContributorIds' : 'downvotingContributorIds';
      var insertPath = '/array-node("' + contribTypeToStore + '")';
      var fetch = db.documents.patch(
        questionURI,
        pb.insert(insertPath, 'last-child', contributorId),
        pb.replace('voteCount', newVoteCount),
        pb.replace('itemTally', newItemTally)
      );

      fetch.result(
        function (response) {
          if (response.uri) {
            reputationChange(qOwnerID, upDown); // side-effect
            return resolve(readDocument(response.uri));
          }
          else {
            return reject({
              error: 'cardinalityViolation',
              userSpec: userSpec,
              count: response.documents.length
            });
          }
        },
        reject
      );

    });

  });
};

/*
 * COMMENT ON A QUESTION
 */
var handleQuestionComment = function (userSpec) {
  var questionId = userSpec.questionId;
  var questionURI = questionsDir + questionId + '.json';
  var commentObj = userSpec.body;
  var commentContent = _.clone(commentTemplate);
  commentContent.creationDate = new Date();
  _.merge(commentContent, commentObj);

  return new Promise(function (resolve, reject) {

    var result = readDocument(questionURI);
    result.then(function (qDoc) {
      var fetch = db.documents.patch(
        questionURI,
        pb.insert('/array-node("comments")', 'last-child', commentContent)
      );

      fetch.result(
        function (response) {
          if (response.uri) {
            return resolve(readDocument(response.uri));
          }
          else {
            return reject({
              error: 'cardinalityViolation',
              userSpec: userSpec,
              count: response.documents.length
            });
          }
        },
        reject
      );

    });

  });
};


/*
 * ANSWER ON A QUESTION
 */
var handleQuestionAnswer = function (userSpec) {
  var questionId = userSpec.questionId;
  var questionURI = questionsDir + questionId + '.json';
  var answerObj = userSpec.body;
  var answerContent = _.clone(answerTemplate);
  answerContent.id = generateUUID();
  answerContent.creationDate = new Date();
  _.merge(answerContent, answerObj);

  return new Promise(function (resolve, reject) {

    var result = readDocument(questionURI);
    result.then(function (qDoc) {
      var newAnswerCount = qDoc.answerCount + 1;

      var fetch = db.documents.patch(
        questionURI,
        pb.replace('answerCount', newAnswerCount),
        pb.insert('/array-node("answers")', 'last-child', answerContent)
      );

      fetch.result(
        function (response) {
          if (response.uri) {
            return resolve(readDocument(response.uri));
          }
          else {
            return reject({
              error: 'cardinalityViolation',
              userSpec: userSpec,
              count: response.documents.length
            });
          }
        },
        reject
      );

    });

  });
};

/*
 * VOTE ON A ANSWER
 */
var handleAnswerVote = function (userSpec) {
  var questionId = userSpec.questionId;
  var answerId = userSpec.answerId;
  var upDown = userSpec.body.upDown;
  var questionURI = questionsDir + questionId + '.json';

  return new Promise(function (resolve, reject) {

    var result = readDocument(questionURI);
    result.then(function (qDoc) {
      var answerDocIndex      = _.findIndex(qDoc.answers, { 'id': answerId });
      var answerDoc           = qDoc.answers[answerDocIndex];
      var mlAnswerDocIndex    = answerDocIndex + 1; // uses 1 based index
      var aOwnerID            = answerDoc.owner.id;
      var newItemTally        = answerDoc.itemTally + upDown;
      var newVoteCount        = qDoc.voteCount + 1;
      var contribTypeToStore  = (upDown === 1) ?
            'upvotingContributorIds' : 'downvotingContributorIds';
      var insertPath = '/answers[' + mlAnswerDocIndex + ']/array-node("'
                                                  + contribTypeToStore + '")';
      var tallyPath = '/answers[' + mlAnswerDocIndex + ']/itemTally';
      var fetch = db.documents.patch(
        questionURI,
        pb.insert(insertPath, 'last-child', contributorId),
        pb.replace(tallyPath, newItemTally),
        pb.replace('voteCount', newVoteCount)
      );

      fetch.result(
        function (response) {
          if (response.uri) {
            reputationChange(aOwnerID, upDown); // side-effect
            return resolve(readDocument(response.uri));
          }
          else {
            return reject({
              error: 'cardinalityViolation',
              userSpec: userSpec,
              count: response.documents.length
            });
          }
        },
        reject
      );

    });

  });
};

/*
 * COMMENT ON AN ANSWER
 */
var handleAnswerComment = function (userSpec) {
  var questionId = userSpec.questionId;
  var answerId = userSpec.answerId;
  var questionURI = questionsDir + questionId + '.json';
  var commentObj = userSpec.body;
  var commentContent = _.clone(commentTemplate);
  commentContent.creationDate = new Date();
  _.merge(commentContent, commentObj);

  return new Promise(function (resolve, reject) {

    var result = readDocument(questionURI);
    result.then(function (qDoc) {
      var answerDocIndex = _.findIndex(qDoc.answers, { 'id': answerId });
      var aDocIndex = answerDocIndex + 1; // uses 1 based index
      var insertPath = '/answers[' + aDocIndex + ']/array-node("comments")';
      var fetch = db.documents.patch(
        questionURI,
        pb.insert(insertPath, 'last-child', commentContent)
      );

      fetch.result(
        function (response) {
          if (response.uri) {
            return resolve(readDocument(response.uri));
          }
          else {
            return reject({
              error: 'cardinalityViolation',
              userSpec: userSpec,
              count: response.documents.length
            });
          }
        },
        reject
      );

    });

  });
};

/*
 * ACCEPT AN ANSWER
 */
var handleAnswerAccept = function (userSpec) {
  var questionId = userSpec.questionId;
  var answerId = userSpec.answerId;
  var questionURI = questionsDir + questionId + '.json';

  return new Promise(function (resolve, reject) {

    var result = readDocument(questionURI);
    result.then(function (qDoc) {
      var answerDocIndex = _.findIndex(qDoc.answers, { 'id': answerId });
      // use answerDocIndex for error checking - ensure ID exists
      var fetch = db.documents.patch(
        questionURI,
        pb.replace('/accepted', true),
        pb.replace('/acceptedAnswerId', answerId)
      );

      fetch.result(
        function (response) {
          if (response.uri) {
            return resolve(readDocument(response.uri));
          }
          else {
            return reject({
              error: 'cardinalityViolation',
              userSpec: userSpec,
              count: response.documents.length
            });
          }
        },
        reject
      );

    });

  });
};


module.exports = function (userSpec) {
  var self = this;
  db = self;
  var operation = userSpec.operation;

  if (operation === 'questionVote') {
    return handleQuestionVote(userSpec);
  }
  else if (operation === 'questionComment') {
    return handleQuestionComment(userSpec);
  }
  else if (operation === 'questionAnswer') {
    return handleQuestionAnswer(userSpec);
  }
  else if (operation === 'answerVote') {
    return handleAnswerVote(userSpec);
  }
  else if (operation === 'answerComment') {
    return handleAnswerComment(userSpec);
  }
  else if (operation === 'answerAccept') {
    return handleAnswerAccept(userSpec);
  }
  else {
    console.log('not implemented');
  }
};
