define(['app/module'], function (module) {

  /**
   * @ngdoc service
   * @name ssContributor
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   */

  module.factory('ssContributor', [

    'mlModelBase', 'mlSchema',
    function (
      mlModelBase, mlSchema
    ) {
      var SsContributorObject = function (spec) {
        mlModelBase.object.call(this, spec);
      };

      SsContributorObject.prototype = Object.create(
        mlModelBase.object.prototype
      );

      var parseVote = function (vote, hash, testOnly) {
        var match;
        var question;
        var answer;
        var matched = true;

        var matchExpr = /\/questions\/([^\/]+)(?:\/answers\/([^\/]+))?$/;

        match = vote.match(matchExpr);
        if (match && match.length === 2) {
          question = hash[match[1]];
          matched = Boolean(question);
          if (!testOnly) {
            hash[match[1]] = {};
          }
        }
        else {
          if (match && match.length === 3) {
            question = hash[match[1]];
            if (!question && testOnly) {
              return false;
            }
            if (!question) {
              question = (hash[match[1]] = {});
            }
            answer = question[match[2]];
            if (testOnly) {
              return Boolean(answer);
            }
            if (question[match[2]]) {
              return true;
            }
            else {
              if (!testOnly) {
                question[match[2]] = {};
                return false;
              }
            }
          }
        }

        return matched;
      };

      var parseVotes = function (votesArray) {
        var questions = {};

        angular.forEach(votesArray, function (vote) {
          parseVote(vote, questions);
        });

        return questions;
      };

      SsContributorObject.prototype.preconstruct = function (spec) {
        if (spec && spec.votes && spec.votes instanceof Array) {
          spec.votes = parseVotes(spec.votes);
        }
      };

      SsContributorObject.prototype.onHttpResponseGET = function (data) {
        if (data && data.votes) {
          data.votes = parseVotes(data.votes);
        }
        this.assignData(data);
      };

      SsContributorObject.prototype.hasVotedOnQuestion = function (qnaDoc) {
        return parseVote(qnaDoc.id, this.votes, true);
      };

      SsContributorObject.prototype.hasVotedOnAnswer = function (
        qnaDoc,
        answer
      ) {
        return parseVote(
          qnaDoc.id + answer.id,
          this.votes,
          true
        );
      };


      SsContributorObject.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/samplestack#contributor',
          required: ['id', 'reputation'],
          properties: {
            websiteUrl: { type:['string', 'null' ] },
            reputation: { type: ['integer'], minimum: 0 },
            aboutMe: { type: [ 'string', 'null'], maxLength:255 },
            // stronger requirements on id (length s/b uuid)
            id: { type: 'string', minLength: 36, maxLength: 36 },
            location: { type: [ 'string', 'null' ]},
            votes: { type: 'object' }  // TODO flesh this out
          }
        })
      };
      SsContributorObject.prototype.getResourceId = function () {
        return 'contributors';
      };



      return mlModelBase.extend('SsContributorObject', SsContributorObject);
    }
  ]);
});
