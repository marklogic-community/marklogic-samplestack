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
        var self = this;
        data.answers = data.answers || [];
        angular.forEach(data.answers, function (answer, index) {
          answer.comments = answer.comments || [];
          angular.forEach(answer.comments, function (comment, index) {
            answer.comments[index] = ssComment.create(comment, self);
          });
          data.answers[index] = ssAnswer.create(answer, self);
        });

        data.comments = data.comments || [];
        angular.forEach(data.comments, function (comment, index) {
          data.comments[index] = ssComment.create(comment, self);
        });

        mlUtil.merge(this, data);

        this.answers.draft = this.answers.draft || ssAnswer.create({}, this);
        // this.comments.draft =
        //     this.comments.draft || ssComment.create({}, this);
        this.testValidity();
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
        self.answers.sort(function (answer1, answer2) {
          if (answer1.id === self.acceptedAnswerId) {
            return -1;
          }
          if (answer2.id === self.acceptedAnswerId) {
            return 1;
          }
          var tallyDiff = (answer2.itemTally || 0) - (answer1.itemTally || 0);
          if (tallyDiff) {
            // more votes first
            return tallyDiff;
          }
          else {
            // chronological
            return  answer1.creationDate - answer2.creationDate;
          }
        });

        this.comments.sort(function (comment1, comment2) {
          return comment1.creationDate - comment2.creationDate;
        });

        this.answers.forEach(function (answer) {
          answer.comments.sort(function (comment1, comment2) {
            return comment1.creationDate - comment2.creationDate;
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

      SsQnaDocObject.prototype.getHttpDataPOST = function () {
        var base = _.clone(
          mlModelBase.object.prototype.getHttpDataPOST.call(this)
        );

        // qnaDoc itself shouldn't go posting draft content -- that is
        // done from within the nested resources.
        //
        // would be nice if lodash had a "deepOmit" function, but faster to
        // do it manually absent that
        base.answers && delete base.answers.draft;
        _.each(base.answers, function (ans) {
          ans.comments && delete ans.comments.draft;
        });
        return base;
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
