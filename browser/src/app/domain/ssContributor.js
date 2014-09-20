define(['app/module'], function (module) {

  /**
   * @ngdoc domain
   * @name ssContributor
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * Information associated with a contributor (as
   * {@link SsContributorObject}).
   *
   * `ssContributor` is a derivation of {@link mlModelBase},
   * customized to be able to fetch contributor information (GET).
   *
   * It is also used by {@link ssSession} to expose information
   * about the currently logged-in user.
   */

  module.factory('ssContributor', [

    'mlModelBase', 'mlSchema',
    function (
      mlModelBase, mlSchema
    ) {
      /**
       * @ngdoc type
       * @name SsContributorObject
       * @description The model instance prototype for
       * {@link ssContributor}.
       */

      /**
       * @ngdoc method
       * @name SsContributorObject#constructor
       * @param {object} spec Data used to populate
       * the new instance.
       * @description Constructor. Uses default implementation.
       */
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

      /**
       * @ngdoc method
       * @name SsContributorObject#prototype.preconstruct
       * @param {object} spec Instance spec from constructor.
       * @description Override. Parses the `votes` property, if present,
       * any, provided to the constructor and replaces the
       * property value with the result.
       */

      SsContributorObject.prototype.preconstruct = function (spec) {
        if (spec && spec.votes && spec.votes instanceof Array) {
          spec.votes = parseVotes(spec.votes);
        }
      };

      /**
       * @ngdoc method
       * @name SsContributorObject#prototype.onHttpResponseGET
       * @param {object} data Data from the call to the server.
       * @description Override. Parses the `votes` property, if present,
       * any, provided to the constructor and replaces the
       * property value with the result.
       */
      SsContributorObject.prototype.onHttpResponseGET = function (data) {
        if (data && data.votes) {
          data.votes = parseVotes(data.votes);
        }
        this.assignData(data);
      };

      /**
       * @ngdoc method
       * @name SsContributorObject#prototype.hasVotesOnQuestion
       * @param {object} qnaDoc The {@link SsQnaDocObject} instance about
       * which to
       * determine voting.
       * @description Override. Whether or not the contributor has
       * voted on the given question.
       */
      SsContributorObject.prototype.hasVotedOnQuestion = function (qnaDoc) {
        return parseVote(qnaDoc.id, this.votes, true);
      };

      /**
       * @ngdoc method
       * @name SsContributorObject#prototype.hasVotedOnAnswer
       * @param {object} qnaDoc The {@link SsQnaDocObject} instance about
       * which to
       * determine voting.
       * @param {object} answer The {@link SsQnaDocObject} `answer` about
       * which to
       * determine voting.
       * @description Override. Whether or not the contributor has
       * voted on the given answer.
       */
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

      /**
       * @ngdoc method
       * @name SsContributorObject#prototype.getResourceId
       * @description Overrides the resource id.
       * @returns {string} 'contributors'
       */
      SsContributorObject.prototype.getResourceId = function () {
        return 'contributors';
      };

      return mlModelBase.extend('SsContributorObject', SsContributorObject);
    }
  ]);
});
