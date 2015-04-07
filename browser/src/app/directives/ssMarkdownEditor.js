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
   * @name ssMarkdownEditor
   * @restrict A
   * @param {expression} ssMarkdownEditor the content to which to bind.
   *
   * @description
   * Enables editing of Markdown content with preview tab and editing controls
   * in a button-bar.  Uses {@link ssMarkdown} for preview and and
   * <a href="https://github.com/GrumpyWizards/ngMarkdown"
   * target="_blank">ngMarkdown</a> for button bar functionality.
   *
   */

  module.directive('ssMarkdownEditor', [function () {
    return {
      restrict: 'A',
      templateUrl: '/app/directives/ssMarkdownEditor.html',
      scope: {
        content: '=content',
        placeholder: '@placeholder'
      },
      link: function (scope, el, attr) {
        scope.selTab = 'edit';
        // Display prompt by adding placeholder attribute to markdown textarea
        if (scope.placeholder) {
          document.getElementsByClassName('markdown-input')[0]
            .setAttribute('placeholder', scope.placeholder);
        }
      }
    };
  }]);
});
