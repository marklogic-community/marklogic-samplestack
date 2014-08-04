define(['app/module'], function (module) {

  /**
   * @ngdoc service
   * @name ssContributor
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   */

  module.factory('ssContributor', [

    'mlModelBase', 'mlSchema',
    function (
      mlModelBase, mlSchema
    ) {
      var SsContributorObject = function (spec) {
        mlModelBase.object.call(this, spec);
      };
      SsContributorObject.prototype = Object.create(
        mlModelBase.object.prototype
      );
      SsContributorObject.prototype.$mlSpec = {
        schema: mlSchema.addSchema({
          id: 'http://marklogic.com/samplestack#contributor',
          required: ['id', 'reputation'],
          properties: {
            websiteUrl: { type:['string', 'null' ] },
            reputation: { type: ['integer'], minimum: 0 },
            aboutMe: { type: [ 'string', 'null'], maxLength:255 },
            // stronger requirements on id (length s/b uuid)
            id: { type: 'string', minLength: 36, maxLength: 36 },
            location: { type: [ 'string', 'null' ]},
            votes: { type: 'array', items: { type: 'string' } }
          }
        })
      };
      SsContributorObject.prototype.getResourceId = function () {
        return 'contributors';
      };

      return mlModelBase.extend('SsContributorObject', SsContributorObject);
    }
  ]);
});
