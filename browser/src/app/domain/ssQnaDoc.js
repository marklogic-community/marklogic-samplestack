define(['app/module'], function (module) {

  /**
   * @ngdoc domain
   * @name ssQnaDoc
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * TBD
   */

  module.factory('ssQnaDoc', [

    '$q',
    'mlModelBase',
    'mlSchema',
    'mlUtil',
    'ssAnswer',
    'ssComment',
    'ssVote',
    function (
      $q, mlModelBase, mlSchema, mlUtil,
      ssAnswer, ssComment, ssVote
    ) {
      /**
       * @ngdoc type
       * @name SsQnaDocObject
       * @description The model instance prototype for
       * {@link ssQnaDoc}.
       */

      /**
       * @ngdoc method
       * @name SsQnaDocObject#constructor
       * @param {object} spec Data used to populate
       * the new instance.
       * @description Constructor. Uses default implementation.
       */
      var SsQnaDocObject = function (spec) {
        mlModelBase.object.call(this, spec);
      };
      SsQnaDocObject.prototype = Object.create(
        mlModelBase.object.prototype
      );

      SsQnaDocObject.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/samplestack#qnaDoc',
          required: ['title', 'text'],
          properties: {
            id: { type: 'string', minLength: 36, maxLength: 36 },
            title: { type: 'string', minLength: 1 },
            text: { type: 'string', minLength: 1 },
            tags: {
              type: 'array',
              items: { type: 'string' }
            }
            // build this out
          }
        })
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.mergeData
       * @description Sets up answer and
       * comment model objects on data, then merges data.
       * @param {object} data Data to merge.
       */
      SsQnaDocObject.prototype.mergeData = function (data) {
        // Replace answers with ssAnswer objects
        var self = this;
        angular.forEach(data.answers, function (answer, index) {
          data.answers[index] = ssAnswer.create(answer, self);
        });
        // Add empty ssAnswer object for posting new answer
        data.answers = data.answers || [];
        data.answers[data.answers.length] = ssAnswer.create({}, this);

        // Replace comments with ssComment objects
        angular.forEach(data.comments, function (comment, index) {
          data.comments[index] = ssComment.create(comment, self);
        });
        // Add empty ssComment object for posting new comment
        data.comments = data.comments || [];
        data.comments[data.comments.length] = ssComment.create({}, this);

        mlUtil.merge(this, data);
        this.testValidity();
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.addAnswer
       * @description Adds new ssAnswer object to end of answers array
       * @param {object} data Answer data.
       * @param {object} parent Answer parent.
       */
      SsQnaDocObject.prototype.addAnswer = function (data, parent) {
        this.answers = this.answers || []; // Ensure an answers array exists
        this.answers[this.answers.length] = ssAnswer.create(data, parent);
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.addComment
       * @description Adds new ssComment object to end of comments array
       * @param {object} data Comment data.
       * @param {object} parent Comment parent.
       */
      SsQnaDocObject.prototype.addComment = function (data, parent) {
        this.comments = this.comments || []; // Ensure an comments array exists
        this.comments[this.comments.length] = ssComment.create(data, parent);
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.vote
       * @description Executes an upvote or downvote on answer.
       * @param {number} val 1 or -1.
       * @param {object} userInfo userInfo from session.
       */
      SsQnaDocObject.prototype.vote = function (val, userInfo) {
        var vote = ssVote.create({upDown: val}, this);
        var self = this;
        if (vote.$ml.valid) {
          return vote.post().$ml.waiting.then(function () {
            userInfo.voteCount++;
          },
          function (error) {
            throw new Error('Error occurred: ' + JSON.stringify(error));
          });
        }
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.getResourceId
       * @description Overrides the resource id.
       * @returns {string} 'questions'
       */
      SsQnaDocObject.prototype.getResourceId = function () {
        return 'questions';
      };

      SsQnaDocObject.prototype.sort = function () {
        var self = this;

        this.answers.sort(function (answer1, answer2) {
          // do not sort empty answers, keep those as-is at end of array
          if (answer1.id === undefined || answer2.id === undefined) {
            return 0;
          }
          if (answer1.id === self.acceptedAnswerId) {
            return -1;
          }
          if (answer2.id === self.acceptedAnswerId) {
            return 1;
          }
          return (answer2.itemTally || 0) - (answer1.itemTally || 0);
        });

        this.comments.sort(function (comment1, comment2) {
          // do not sort empty comments, keep those as-is at end of array
          if (comment1.id === undefined || comment2.id === undefined) {
            return 0;
          }
          else {
            return comment1.creationDate > comment2.creationDate;
          }
        });

        this.answers.forEach(function (answer) {
          answer.comments.sort(function (comment1, comment2) {
            // do not sort empty comments, keep those as-is at end of array
            if (comment1.id === undefined || comment2.id === undefined) {
              return 0;
            }
            else {
              return comment1.creationDate > comment2.creationDate;
            }
          });
        });
      };

      var patchVotes = function (obj) {
        obj.downvotingContributorIds = _.transform(
          obj.downvotingContributorIds,
          function (result, val) {
            result[val] = true;
          },
          {}
        );

        obj.upvotingContributorIds = _.transform(
          obj.upvotingContributorIds,
          function (result, val) {
            result[val] = true;
          },
          {}
        );
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.onResponseGET
       * @param {object} data Data from the server.
       * @description Override. Processes the data to standardize and
       * adapt the schema for the browser.
       *
       * <p style="color: red">
       * TODO This method will be revisited as the REST API
       * schema is standardized and as proper seed data becomes
       * available. It is likely that the method will not be required at
       * that time. It is primarily patching for holes in seed data and
       * inconsistencies in the domain schema which are being addressed.
       * </p>
       */
      SsQnaDocObject.prototype.onResponseGET = function (
        data, additionalPromises
      ) {
        mlModelBase.object.prototype.onResponseGET.call(this, data);

        patchVotes(this);
        angular.forEach(this.answers, function (answer) {
          patchVotes(answer);
        });

        this.sort();
      };

      SsQnaDocObject.prototype.onResponsePOST = function (
        data, additionalResolves
      ) {

        mlModelBase.object.prototype.onResponsePOST.call(this, data);

        patchVotes(this);
        angular.forEach(this.answers, function (answer) {
          patchVotes(answer);
        });

        this.sort();
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.soOwnerId
       * @param {object} obj A question, answer or comment object (i.e.
       * something that has an `owner` property.
       * @returns {String|null} If a local owner, null, otherwise the
       * StackOverflow
       * user id of the owner.
       * @description If a StackOverflow user owns the content object, the id
       * of that SO user.
       */
      SsQnaDocObject.prototype.soOwnerId = function (obj) {
        if (this.isLocalOwner(obj)) {
          return null;
        }
        else {
          return obj.owner ? obj.owner.id : null;
        }
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.soUserName
       * @param {object} obj A question, answer or comment object (i.e.
       * something that has an `owner` property.
       * @returns {String|null} If a local owner, null, otherwise the
       * StackOverflow
       * user's display name.
       * @description If a StackOverflow user owns the content object, the
       * display name
       * of that SO user.
       */
      SsQnaDocObject.prototype.soUserName = function (obj) {
        return this.soOwnerId(obj) ?
            obj.owner.displayName :
            null;
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.soUserLink
       * @param {object} obj A question, answer or comment object (i.e.
       * something that has an `owner` property.
       * @returns {String|null} If a local owner, null, otherwise a URL
       * to the StackOverflow user profile.
       * @description If a StackOverflow user owns the content object, the
       * a URL to the user profile.
       */
      SsQnaDocObject.prototype.soUserLink = function (obj) {
        return this.soOwnerId(obj) && obj.owner.id ?
          'http://stackoverflow.com/users/' + obj.owner.id :
          null;
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.noValidUser
       * @param {object} obj A question, answer or comment object (i.e.
       * @description
       * <p style="color: red">
       * TODO: this method can go away with better data.
       */
      SsQnaDocObject.prototype.noValidUser = function (obj) {
        var noneValid = !this.soOwnerId(obj) && !this.isLocalOwner(obj);
        return noneValid;
      };

      var svc = mlModelBase.extend('SsQnaDocObject', SsQnaDocObject);

      svc.getOne = function (spec, contributorId) {
        return svc.ensureInstance(spec).getOne(contributorId);
      };

      return svc;
    }
  ]);
});
