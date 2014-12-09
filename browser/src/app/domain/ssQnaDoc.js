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
    'ssHasVoted',
    'ssVote',
    function (
      $q, mlModelBase, mlSchema, mlUtil,
      ssAnswer, ssComment, ssHasVoted, ssVote
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
          required: ['title'],
          properties: {
            id: { type: 'string', minLength: 36, maxLength: 36 },
            title: { type: 'string', minLength: 1 },
            text: { type: 'string' },
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
       * @description Sets hasVoted data on $ml, sets up answer and
       * comment model objects on data, then merges data.
       * @param {object} data Data to merge.
       */
      SsQnaDocObject.prototype.mergeData = function (data) {
        if (data.hasVoted) {
          this.$ml.hasVotedObject = data.hasVoted;
          delete data.hasVoted;
        }

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
       * @name SsQnaDocObject#prototype.hasVoted
       * @description Returns whether current user has voted on this document.
       * @returns {boolean} true or false
       */
      SsQnaDocObject.prototype.hasVoted = function (id) {
        if (this.$ml.hasVoted && this.$ml.hasVoted.voteIds) {
          return this.$ml.hasVoted.voteIds[id];
        }
        else {
          return false;
        }
      };

      // Define hasVotedOn property as the return value of the hasVoted method.
      Object.defineProperty(SsQnaDocObject.prototype, 'hasVotedOn', {
        get: function () {
          return this.hasVoted(this.id);
        }
      });

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
          vote.post().$ml.waiting.then(function () {
            userInfo.votes.push(self.id);
          },
          function (error) {
            throw new Error('Error occurred: ' + JSON.stringify(error));
          });
        }
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.setVoted
       * @description Sets Qna Doc as having been voted on.
       * @param {string} id Optional ID to set. If empty, uses this.id.
       */
      SsQnaDocObject.prototype.setVoted = function (id) {
        if (this.$ml.hasVoted && this.$ml.hasVoted.voteIds) {
          this.$ml.hasVoted.voteIds[id ? id : this.id] = true;
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
          if (answer1.id === self.acceptedAnswerId) {
            return -1;
          }
          if (answer2.id === self.acceptedAnswerId) {
            return 1;
          }
          return (answer2.itemTally || 0) - (answer1.itemTally || 0);
        });

        this.comments.sort(function (comment1, comment2) {
          return comment1.createDate < comment2.creationDate;
        });

        this.answers.forEach(function (answer) {
          answer.comments.sort(function (comment1, comment2) {
            return comment1.createDate < comment2.creationDate;
          });
        });
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
        var self = this;

        if (additionalPromises && additionalPromises.length) {
          this.$ml.hasVoted = additionalPromises[0];
        }

        mlModelBase.object.prototype.onResponseGET.call(this, data);
        this.sort();

      };

      SsQnaDocObject.prototype.onResponsePOST = function (
        data, additionalResolves
      ) {
        if (additionalResolves && additionalResolves.length) {
          this.$ml.hasVoted = additionalResolves[0];
        }

        mlModelBase.object.prototype.onResponsePOST.call(this, data);
        this.sort();
      };

      SsQnaDocObject.prototype.getOne = function (contributorId) {
        var additionalPromises = contributorId ?
            [
              ssHasVoted.getOne({
                contributorId: contributorId,
                questionId: this.id
              }).$ml.waiting
            ] :
            [];
        return this.http('GET', additionalPromises);
      };

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.isLocalOwner
       * @param {object} obj A question, answer or comment object (i.e.
       * something that has an `owner` property.
       * @returns {boolean} `true` if the owner is "locally created",
       * `false` if the owner is from Stack Overflow.
       * if the data Data from the server.
       * @description Whether or not a content object is owned by a local or
       * StackOverflow user.
       *
       * <p style="color: red">
       * TODO this method uses an ugly hack and will be rewritten once
       * better data are availale from the server.
       * </p>
       */
      SsQnaDocObject.prototype.isLocalOwner = function (obj) {
        var n = obj.owner ?
            obj.owner.displayName :
            '';
        return n === 'joeUser' || n === 'maryAdmin';
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

      /**
       * @ngdoc method
       * @name SsQnaDocObject#prototype.formatDate
       * @param {string} str A date string to parse and reformat.
       * @description Reformats a date for display.
       */
      SsQnaDocObject.prototype.formatDate = function (str) {
        if (str && str.length) {
          var date = mlUtil.moment(str);
          return date.format('MMM D, \'YY') +
              ' at ' + date.format('h:mm');

        }
      };

      var svc = mlModelBase.extend('SsQnaDocObject', SsQnaDocObject);

      svc.getOne = function (spec, contributorId) {
        return svc.ensureInstance(spec).getOne(contributorId);
      };

      return svc;
    }
  ]);
});
