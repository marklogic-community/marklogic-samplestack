define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc domain
   * @name mlSession
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * Handles authentication and subsequent user information
   * associated with a session with a REST server.
   *
   * `mlSearch` is a derivation of {@link mlModelBase}, customized to
   * handle logging into a REST server via a username
   * and password. Its default configuration reuqires both properties to be
   * strings of at least 5 characters.
   *
   * When a session is *succcessfully* posted to the REST server, the response
   * from the server overwrites the session information that was used during the
   * login process. As such, and in particular, **passwords** are cleared upon
   * successful login.
   *
   * After login, the mlSession is considered valid if it has both an `id`
   * property and an array of strings assigned to the `role` property, which
   * are to represent the LDAP roles with which the user is associated.
   */

  module.factory('mlSession', [

    'mlModelBase', 'mlSchema',
    function (
      mlModelBase, mlSchema
    ) {
      var MlSessionObject = function (spec) {
        mlModelBase.object.call(this, spec);
      };
      MlSessionObject.prototype = Object.create(mlModelBase.object.prototype);
      MlSessionObject.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/#session',
          required:['username'],
          properties: {
            username: { type: 'string', minLength: '5' }
          },
          oneOf: [
            {
              required: ['password'],
              properties: {
                password: { type: 'string', minLength: '5' }
              }
            },
            {
              required: ['id', 'role'],
              properties: {
                id: { type: 'string', minLength: '1' },
                password: { not: {} },
                role: {
                  type: 'array', items: { type: 'string' }
                }
              }
            }
          ]
        })
      };

      MlSessionObject.prototype.getHttpUrl = function (httpMethod) {
        return '/' + this.getResourceName(httpMethod);
      };

      MlSessionObject.prototype.onResponsePOST = function (data) {
        delete this.password;
        this.assignData(data); // drops password
      };

      return mlModelBase.extend('MlSessionObject', MlSessionObject);

    }
  ]);
});
