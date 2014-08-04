define(['app/module'], function (module) {

  /**
   * @ngdoc service
   * @name ssSession
   * @requires mlModelBase
   * @requires mlSchema
   * @requires mlSession
   * @requires ssContributor
   *
   * @description
   * TBD
   *
   */

  module.factory('ssSession', [

    'mlModelBase', 'mlSchema', 'mlSession', 'ssContributor',
    function (
      mlModelBase, mlSchema, mlSession, ssContribtor
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
      SsSessionObject.prototype.getResourceName = function (httpMethod) {
        switch (httpMethod) {
          case 'POST':
            return 'login';
          case 'GET':
            return 'contributors';
          case 'DELETE':
            return 'logout';
          default:
            throw new Error('unsupported http method: ' + httpMethod);
        }
      };

      SsSessionObject.prototype.getEndpointIdentifier = function (httpMethod) {
        if (httpMethod === 'DELETE') {
          return '';
        }
        else {
          return '/' + this.id;
        }
      };

      SsSessionObject.prototype.getResourceId = function (httpMethod) {
        switch (httpMethod) {
          case 'POST':
            return 'login';
          case 'GET':
            return 'contributors';
          case 'DELETE':
            return 'logout';
          default:
            throw new Error('unsupported http method: ' + httpMethod);
        }
      };

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

      SsSessionObject.prototype.getHttpMethodOverride = function (httpMethod) {
        if (httpMethod === 'DELETE') {
          return 'GET';
        }
        else {
          return httpMethod;
        }
      };

      SsSessionObject.prototype.put = function () {
        throw new Error('PUT is not supported on ssSession');
      };

      SsSessionObject.prototype.onResponsePOST = function (data) {
        delete this.password;
        this.id = data.id;
        this.role = data.role;
        this.userInfo = data;
      };
      SsSessionObject.prototype.onResponseGET =
          SsSessionObject.prototype.onResponsePOST;

      return mlModelBase.extend('SsSessionObject', SsSessionObject);
    }
  ]);
});
