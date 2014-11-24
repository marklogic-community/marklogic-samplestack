define(['app/module'], function (module) {

  /**
   * @ngdoc domain
   * @name ssSession
   * @requires mlModelBase
   * @requires mlSchema
   * @requires mlSession
   * @requires ssContributor
   *
   * @description
   * TBD
   */

  module.factory('ssSession', [

    'mlModelBase', 'mlSchema', 'mlSession', 'ssContributor',
    function (
      mlModelBase, mlSchema, mlSession, ssContributor
    ) {

      var sessionObject = mlSession.object;

      var SsSessionObject = function (spec) {
        mlSession.object.call(this, spec);
      };
      SsSessionObject.prototype = Object.create(
        mlSession.object.prototype
      );
      SsSessionObject.prototype.$mlSpec.schema = mlSchema.addSchema({
        id: 'http://marklogic.com/samplestack#session',
        allOf: [
          { $ref: 'http://marklogic.com/#session' }
        ],
        properties: {
          userInfo: { $ref: 'http://marklogic.com/samplestack#contributor'}
        }
      });

      SsSessionObject.prototype.getHttpHeaders = function (httpMethod) {
        if (httpMethod === 'POST') {
          return {
            'Content-Type':'application/x-www-form-urlencoded'
          };
        }
        else {
          return undefined;
        }
      };

      SsSessionObject.prototype.getHttpDataPOST = function () {
        return 'username=' + encodeURI(this.username) + '&' +
            'password=' + encodeURI(this.password);
      };

      SsSessionObject.prototype.onResponsePOST =
          SsSessionObject.prototype.onResponseGET = function (data) {
            delete this.password;
            data = {
              id: data.id,
              username: data.userName,
              role: data.role,
              userInfo: data
            };
            this.assignData(data);
          };

      return mlModelBase.extend('SsSessionObject', SsSessionObject);
    }
  ]);
});
