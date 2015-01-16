define(['app/module'], function (module) {

  /**
   * @ngdoc domain
   * @name ssContributor
   * @requires mlModelBase
   * @requires mlSchema
   *
   * @description
   * Information associated with a contributor (as
   * {@link SsContributorObject}).
   *
   * `ssContributor` is a derivation of {@link mlModelBase},
   * customized to be able to fetch contributor information (GET).
   *
   * It is also used by {@link ssSession} to expose information
   * about the currently logged-in user.
   */

  module.factory('ssContributor', [

    'mlModelBase', 'mlSchema',
    function (
      mlModelBase, mlSchema
    ) {
      /**
       * @ngdoc type
       * @name SsContributorObject
       * @description The model instance prototype for
       * {@link ssContributor}.
       */

      /**
       * @ngdoc method
       * @name SsContributorObject#constructor
       * @param {object} spec Data used to populate
       * the new instance.
       * @description Constructor. Uses default implementation.
       */
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
            reputation: { type: ['integer'] },
            aboutMe: { type: [ 'string', 'null'], maxLength:255 },
            // stronger requirements on id (length s/b uuid)
            id: { type: 'string', minLength: 36, maxLength: 36 },
            location: { type: [ 'string', 'null' ]},
            voteCount: { type: [ 'integer' ] }
          }
        })
      };

      /**
       * @ngdoc method
       * @name SsContributorObject#prototype.getResourceId
       * @description Overrides the resource id.
       * @returns {string} 'contributors'
       */
      SsContributorObject.prototype.getResourceId = function () {
        return 'contributors';
      };

      return mlModelBase.extend('SsContributorObject', SsContributorObject);
    }
  ]);
});
