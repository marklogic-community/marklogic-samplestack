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
            // use parent's GET so that we cause it to include its identifying
            // information
            var path = //'/questions' +
              this.$ml.parent.getHttpUrl('GET') +
              '/' + this.getResourceName(httpMethod);
            return path;
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
