define(['app/module'], function (module) {

  /**
   * @ngdoc domain
   * @name ssAcceptedAnswer
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * TODO: This component is not yet implemented.
   */

  module.factory('ssAcceptedAnswer', [

    'mlModelBase', 'mlSchema',
    function (
      mlModelBase, mlSchema
    ) {

      var ssAcceptedAnswer = function (spec, parent) {
        mlModelBase.object.call(this, spec, parent);
      };

      ssAcceptedAnswer.prototype = Object.create(
        mlModelBase.object.prototype
      );

      ssAcceptedAnswer.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/samplestack#accept',
          required: [],
          properties: {
            upDown: { }
          }
        })
      };

      ssAcceptedAnswer.prototype.getResourceName = function (httpMethod) {
        return 'accept';
      };

      ssAcceptedAnswer.prototype.getHttpUrl = function (httpMethod) {
        switch (httpMethod) {
          case 'POST':
            var url =
              '/' + this.$ml.parent.$ml.parent.getResourceName(httpMethod) +
              this.$ml.parent.$ml.parent.getEndpointIdentifier(httpMethod) +
              '/' + this.$ml.parent.getResourceName(httpMethod) +
              this.$ml.parent.getEndpointIdentifier(httpMethod) +
              '/' + this.getResourceName(httpMethod);
            return url;
          default:
            throw new Error(
              'unsupported http method passed to getEndpoint: ' + httpMethod
            );
        }
      };

      ssAcceptedAnswer.prototype.onResponsePOST = function (data) {
        return this.$ml.parent.onResponsePOST(data);
      };

      return mlModelBase.extend('ssAcceptedAnswer', ssAcceptedAnswer);
    }
  ]);
});
