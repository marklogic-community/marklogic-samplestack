define(['_marklogic/module'], function (module) {

  /**
   * @ngdoc service
   * @name mlSession
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * TBD
   *
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

      MlSessionObject.prototype.onResponsePOST = function (data) {
        delete this.password;
        this.assignData(data); // drops password
      };

      return mlModelBase.extend('MlSessionObject', MlSessionObject);

    }
  ]);
});
