

// {
//   contributorId,
//   questionId,
//   votes: {
//     '12341324': true,
//     '923423498': true
//
//   }
// }



  // SsHasVotedObject.prototype.getEndpointIdentifier = function (httpMethod) {
  // refer to both contributorId and questionId rather than an id property
  //   return '/' + this.id;
  // };
  //
  // consider also whether this issue should be tackled in a getHttpUrl override


define(['app/module'], function (module) {

  /**
   * @ngdoc domain
   * @name ssHasVoted
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * TBD
   */

  module.factory('ssHasVoted', [

    '$q', 'mlModelBase', 'mlSchema', 'mlUtil',
    function (
      $q, mlModelBase, mlSchema, mlUtil
    ) {
      /**
       * @ngdoc type
       * @name SsHasVoted
       */

      /**
       * @ngdoc method
       * @name SsHasVoted#constructor
       * @param {object} spec Data used to populate
       * the new instance.
       * @description Constructor. Uses default implementation.
       */
      var SsHasVotedObject = function (spec, parent) {
        mlModelBase.object.call(this, spec, parent);
      };
      SsHasVotedObject.prototype = Object.create(
        mlModelBase.object.prototype
      );

      SsHasVotedObject.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/samplestack#hasVoted',
          //required: ['text'],
          properties: {
            contributorId: { type: 'string' },
            questionId: { type: 'string' },
            voteIds: { type: 'object' }
          }
        })
      };

      SsHasVotedObject.prototype.getResourceName = function (httpMethod) {
        return 'hasVoted';
      };

      SsHasVotedObject.prototype.getHttpUrl = function (httpMethod) {
        switch (httpMethod) {
          case 'GET':
            return '/' + this.getResourceName(httpMethod) +
            '?contributorId=' + this.contributorId +
            '&questionId=' + this.questionId;
          default:
            throw new Error(
              'unsupported http method passed to getEndpoint: ' + httpMethod
            );
        }
      };

      // Endpoint returns entire QnaDoc content, call parent method
      SsHasVotedObject.prototype.onResponseGET = function (data) {
        var voteIds = {};
        angular.forEach(data, function (value, index) {
          voteIds[value] = true;
        });
        this.voteIds = voteIds;
      };

      return mlModelBase.extend('SsHasVotedObject', SsHasVotedObject);
    }
  ]);
});
