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

define([
  'app/module'
], function (module) {

  /**
   * @ngdoc directive
   * @name ssMarkdown
   * @restrict A
   * @param {string} ssMarkdown Name of the scope property to which
   * to
   * bind.
   *
   * @description
   * Wraps an instance of
   * [angular-marked](https://://github.com/Hypercubed/angular-marked).
   */

  module.directive('ssMarkdown', [function () {
    return {
      restrict: 'A',
      compile: function (tElement, tAttrs) {
        tElement.append('<div marked="' + tAttrs.ssMarkdown + '"></div>');
      }
    };
  }]);
});
