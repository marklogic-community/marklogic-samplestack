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
  'testHelper',
  'text!app/directives/ssMarkdownEditor.html'
], function (helper, html) {

  return function () {
    describe('ssMarkdownEditor', function () {
      var el;
      var scope;
      var $compile;
      var divElement;
      var editorElement;
      var editorScope;
      var scopeObj = {
        testContent: undefined
      };

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function ($rootScope, _$httpBackend_, _$compile_, _$timeout_) {
            scope         = $rootScope.$new();
            $compile      = _$compile_;

            divElement = angular.element('<div"/>');
            editorElement = angular.element(
              '<div ss-markdown-editor content="obj.testContent"></div>'
            );
            _$httpBackend_.expectGET('/app/directives/ssMarkdownEditor.html')
                .respond(html);
            divElement.append(editorElement);
            $compile(divElement)(scope);
            editorScope = editorElement.isolateScope();
            scope.obj = scopeObj;

            _$httpBackend_.flush();

            done();
          }
        );
      });

      it(
        'should be rendering question in textarea',
          function () {
            scope.obj.testContent = 'this is my text `var code = content;`';
            scope.$apply();
            var txtArea = editorElement.find('textarea');
            txtArea.val().should.equal(scope.obj.testContent);
          }
      );

      it(
        'should have rendered markdown in content area',
          function () {
            scope.obj.testContent = '# test\n';
            scope.$apply();
            angular.element(
              editorElement[0].querySelector('.ss-markdown-editor-preview h1')
            ).text().should.equal('test');
          }
      );

    });

  };
});
