/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
            // displayName???
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
