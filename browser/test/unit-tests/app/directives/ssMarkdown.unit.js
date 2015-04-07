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

define(['testHelper'], function (helper) {

  return function () {
    describe('ssMarkdown', function () {
      var el;
      var scope;
      var $compile;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function ($rootScope, _$httpBackend_, _$compile_, _$timeout_) {

            scope = $rootScope.$new();
            $compile = _$compile_;

            el = angular.element(
              '<div><div ss-markdown="content"/></div>'
            );
            $compile(el)(scope);

            done();
          }
        );
      });

      it(
        'should call highlight on code',
          function () {
            this.timeout(3000);
            scope.content = '# I Heading\n\n' +
                '```javascript\nreturn \'I Code\';\n```\n';
            scope.$apply();
            el.find('h1').text().should.equal('I Heading');
            el.find('code').text().should.equal('return \'I Code\';\n');
          }
      );
    });

  };
});
