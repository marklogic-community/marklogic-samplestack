var Promise = require('bluebird');
var qb = require('marklogic').queryBuilder;
var _ = require('lodash');
var uuid = require('node-uuid');

module.exports = function (userSpec) {
  var self = this;

  var readDocument = function(uri) {
    return new Promise(function (resolve, reject) {
      db.documents.read(uri).result(
        function (response) {
          return resolve(response[0].content);
        },reject
      );
    });
  };

  return new Promise(function (resolve, reject) {
    var id = generateUUID();
    var questionURI = '/questions/' + id + '.json';
    var questionObj = {
      "accepted":false,
      "acceptedAnswerId":null,
      "answerCount":0,
      "answers":[],
      "comments":[],
      "creationDate":new Date(),
      "id":id,
      "itemTally":0,
      "lastActivityDate":new Date(),
      /* TODO: Need to generate this piece somehow */
      "owner":{
        "id":"cf99542d-f024-4478-a6dc-7e723a51b040",
        "displayName":"JoeUser",
        "userName":"joe@example.com"
      },
      "voteCount":0,
      "upvotingContributorIds":[],
      "downvotingContributorIds":[]
    };
    _.merge(questionObj, userSpec);

    var fetch = self.documents.write(
      { uri: questionURI,
        contentType: 'application/json',
        content: questionObj
      }
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
        return resolve(readDocument(response.documents[0].uri));
      },
      reject
    );
  });
};
