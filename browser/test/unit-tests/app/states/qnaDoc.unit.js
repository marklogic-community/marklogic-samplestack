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
  'mocks/index',
  'text!app/states/_root.html'
], function (helper, mocks, rootHtml) {

  return function () {
    describe('qnaDoc', function () {
      // var $injector;
      var $rootScope;
      var $controller;
      var $httpBackend;
      var $q;
      var $timeout;
      var appRouting;

      var ssQnaDoc;
      var scope;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (
            _$controller_,
            _$httpBackend_,
            _$timeout_,
            _$rootScope_,
            _appRouting_,
            _ssQnaDoc_
          ) {
            // $injector = _$injector_;
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            $rootScope = _$rootScope_;
            ssQnaDoc = _ssQnaDoc_;
            appRouting = _appRouting_;

            scope = $rootScope.$new();
            scope.setPageTitle = sinon.spy();
            scope.setLoading = function () {};

            $httpBackend.whenGET('/app/states/_root.html')
                .respond(rootHtml);
            $httpBackend.whenGET('/app/states/_layout.html')
                .respond(200);
            $httpBackend.whenGET('/app/states/qnaDoc.html')
                .respond(200);
            $httpBackend.whenGET('/app/states/explore.html')
                .respond(200);

            done();
          }
        );
      });

      describe('qnaDocCtlr', function (done) {
        var qnaDocCtlr;
        xit('should know when a contributor can vote', function (done) {
          appRouting.params = { id: 123 };
          qnaDocCtlr = $controller('qnaDocCtlr', { $scope: scope });

          $httpBackend.expectGET('/v1/questions/123')
              .respond(mocks.question);
          scope.$apply();
          $httpBackend.flush();
          $timeout.flush();
          scope.doc.should.be.ok;

          done();
        });
      });

    });
  };
});
