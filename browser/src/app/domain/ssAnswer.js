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
   * @name ssAnswer
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * TBD
   */

  module.factory('ssAnswer', [

    '$q',
    'mlModelBase',
    'mlSchema',
    'mlUtil',
    'ssComment',
    'ssVote',
    'ssAcceptedAnswer',
    function (
      $q, mlModelBase, mlSchema, mlUtil, ssComment,
      ssVote, ssAcceptedAnswer
    ) {
      /**
       * @ngdoc type
       * @name SsAnswerObject
       * @description The model instance prototype for
       * {@link ssAnswer}.
       */

      /**
       * @ngdoc method
       * @name SsAnswerObject#constructor
       * @param {object} spec Data used to populate
       * the new instance.
       * @description Constructor. Uses default implementation.
       */
      var SsAnswerObject = function (spec, parent) {
        mlModelBase.object.call(this, spec, parent);
      };
      SsAnswerObject.prototype = Object.create(
        mlModelBase.object.prototype
      );

      // Define hasVotedOn property as the return value of the parent
      // document's hasVoted method.
      Object.defineProperty(SsAnswerObject.prototype, 'hasVotedOn', {
        get: function () {
          return this.$ml.parent.hasVoted(this.id);
        }
      });

      /**
       * @ngdoc method
       * @name SsAnswerObject#prototype.vote
       * @description Executes an upvote or downvote on answer.
       * @param {number} val 1 or -1.
       * @param {object} userInfo userInfo from session.
       */
      SsAnswerObject.prototype.vote = function (val, userInfo) {
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
       * @name SsAnswerObject#prototype.accept
       * @description Accepts the answer.
       */
      SsAnswerObject.prototype.accept = function () {
        var self = this;
        var acceptedAnswer = ssAcceptedAnswer.create({}, this);
        if (acceptedAnswer.$ml.valid) {
          return acceptedAnswer.post().$ml.waiting.then(function () {
          },
          function (error) {
            throw new Error('Error occurred: ' + JSON.stringify(error));
          });
        }
      };

      /**
       * @ngdoc method
       * @name SsAnswerObject#prototype.setVoted
       * @description Sets answer as having been voted on.
       */
      SsAnswerObject.prototype.setVoted = function () {
        this.$ml.parent.setVoted(this.id);
      };

      SsAnswerObject.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/samplestack#answer',
          //required: ['text'], // this is breaking validation on answer save
          properties: {
            id: {
              type: 'string',
              minLength: 36,
              maxLength: 36
            },
            text: { type: 'string' }
          }
        })
      };

      /**
       * @ngdoc method
       * @name SsAnswerObject#prototype.mergeData
       * @description Sets up comment model objects on data, then merges
       * data.
       * @param {object} data Data to merge.
       */
      SsAnswerObject.prototype.mergeData = function (data) {
        var self = this;

        // Replace comments with ssComment objects
        data.comments = data.comments || [];
        angular.forEach(data.comments, function (comment, index) {
          data.comments[index] = ssComment.create(comment, self);
        });

        mlUtil.merge(this, data);

        this.testValidity();
      };

      SsAnswerObject.prototype.getResourceName = function (httpMethod) {
        return 'answers';
      };

      /**
       * @ngdoc method
       * @name SsAnswerObject#prototype.getHttpUrl
       * @description Returns URL string for accessing REST endpoint based
       * on HTTP method. Overrides mlModelBase method since the referencing
       * the parent object in the URL is required. Ends up posting to
       * /v1/questions/{questionid}/answers (given current
       * parent resource name). This could be genericized as a means to deal
       * with posting of nested resources generally.
       * @param {string} httpMethod HTTP method.
       */
      SsAnswerObject.prototype.getHttpUrl = function (httpMethod) {
        switch (httpMethod) {
          case 'POST':
            return '/' + this.$ml.parent.getResourceName(httpMethod) +
                this.$ml.parent.getEndpointIdentifier(httpMethod) +
                '/' + this.getResourceName(httpMethod);
          case 'GET':
            return '/' + this.$ml.parent.getResourceName(httpMethod) +
                this.$ml.parent.getEndpointIdentifier(httpMethod) +
                '/' + this.getResourceName(httpMethod) +
                '/' + this.id;
          default:
            throw new Error(
              'unsupported http method passed to getEndpoint: ' + httpMethod
            );
        }
      };

      /**
       * @ngdoc method
       * @name SsAnswerObject#prototype.onResponsePOST
       * @description Overrides mlModelBase method. Since endpoint returns
       * an entire QnaDoc object, the answer's parent method is called.
       * @param {string} data Response data
       */
      SsAnswerObject.prototype.onResponsePOST = function (data) {
        return this.$ml.parent.onResponsePOST(data);
      };

      return mlModelBase.extend('SsAnswerObject', SsAnswerObject);
    }
  ]);
});
