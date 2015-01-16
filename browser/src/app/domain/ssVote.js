define(['app/module'], function (module) {

  /**
   * @ngdoc domain
   * @name ssVote
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * TODO: This component is not yet implemented.
   */

  module.factory('ssVote', [

    'mlModelBase', 'mlSchema',
    function (
      mlModelBase, mlSchema
    ) {

      var SsVote = function (spec, parent) {
        mlModelBase.object.call(this, spec, parent);
      };

      SsVote.prototype = Object.create(
        mlModelBase.object.prototype
      );

      SsVote.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/samplestack#vote',
          required: ['upDown'],
          properties: {
            upDown: { enum: [1, -1] }
          }
        })
      };

      SsVote.prototype.getResourceName = function (httpMethod) {
        if (this.upDown === 1) {
          return 'upvotes';
        }
        else if (this.upDown === -1) {
          return 'downvotes';
        }
        else {
          throw new Error({
            message: 'invalid upDown property: ' + this.upDown,
            cause: 'ssVote:getResourceName'
          });
        }
      };

      SsVote.prototype.getHttpUrl = function (httpMethod) {
        switch (httpMethod) {
          case 'POST':
            return '/questions' +
            this.$ml.parent.getEndpointIdentifier(httpMethod) +
            '/' + this.getResourceName(httpMethod);
          default:
            throw new Error(
              'unsupported http method passed to getEndpoint: ' + httpMethod
            );
        }
      };

      SsVote.prototype.onResponsePOST = function (data) {
        this.$ml.parent.onResponsePOST(data);
      };

      return mlModelBase.extend('SsVote', SsVote);
    }
  ]);
});
