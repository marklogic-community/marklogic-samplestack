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
