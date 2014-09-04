define(['app/module'], function (module) {

  /**
   * @ngdoc service
   * @name ssVote
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   */

  module.factory('ssVote', [

    'mlModelBase', 'mlSchema',
    function (
      mlModelBase, mlSchema
    ) {
      var SsVote = function (spec) {
        mlModelBase.object.call(this, spec);
      };
      SsVote.prototype = Object.create(
        mlModelBase.object.prototype
      );
      SsVote.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/samplestack#vote',
          required: ['resourcePath', 'upDown'],
          properties: {
            resourcePath: { type:['string' ] },
            upDown: { enum: [1, -1] },
          }
        })
      };
      SsVote.prototype.getResourceName = function (httpMethod) {
        if (this.upDown === 1) {
          return this.resourcePath + '/upvotes';
        }
        else if (this.upDown === -1) {
          return this.resourcePath + '/downvotes';
        }
        else {
          throw new Error({
            message: 'invalid upDown property: ' + this.upDown,
            cause: 'ssVote:getResourceName'
          });
        }
      };

      var throwMethod = function (method) {
        return function () {
          throw new Error({
            message: 'ssVote does not implement ' + method,
            cause: 'ssVote'
          });
        };
      };

      SsVote.prototype.getResourceId = function (httpMethod) {
        switch (httpMethod) {
          case 'POST':
          case 'GET':
          case 'DELETE':
            return mlModelBase.object.prototype.getResourceId.call(
              this, httpMethod
            );
          default:
            throw new Error({
              message: 'ssVote does not implement ' + httpMethod,
              cause: 'getResourceId'
            });
        }
      };

      SsVote.prototype.put =
          SsVote.prototype.get =
          SsVote.prototype.getOne =
          SsVote.prototype.del = throwMethod;

      return mlModelBase.extend('SsVote', SsVote);
    }
  ]);
});
