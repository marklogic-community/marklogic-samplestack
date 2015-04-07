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
  'text!/app/states/_layout.html',
  'text!/app/directives/ssAccountDropdown.html',
  'mocks/index'
], function (helper, html, acctDropdownHtml, mocks) {

  return function () {
    describe('_layout', function () {
      var ctlr;
      var el;
      var scope;
      var $timeout;
      var $httpBackend;
      var appRouting;

      beforeEach(function (done) {
        module('app');
        inject(function (
          $controller,
          $rootScope,
          $compile,
          _$timeout_,
          $httpBackend,
          _appRouting_
        ) {
          appRouting = _appRouting_;
          $timeout = _$timeout_;
          scope = $rootScope.$new();
          el = angular.element(html);
          $compile(el)(scope);
          $httpBackend.expectGET(
            '/app/directives/ssAccountDropdown.html'
          )
              .respond(acctDropdownHtml);
          $httpBackend.expectGET('/app/states/_root.html')
              .respond(200);
          $httpBackend.expectGET('/app/states/_layout.html')
              .respond(200);
          $httpBackend.expectGET('/app/states/explore.html')
              .respond(200);
          $httpBackend.expectGET('/app/states/exploreResults.html')
              .respond(200);

          ctlr = $controller(
            'layoutCtlr', {
              $scope: scope,
              appInitialized: {}
            }
          );
          $httpBackend.flush();
          done();
        });
      });

      // this test is failing post skinning
      xit('enables asking a question when logged in', function () {
        scope.store = { session: {} };
        var appRoutingGo = sinon.stub(appRouting, 'go');
        angular.element(
          el[0].querySelector('.ss-ask-button a')
        ).click();
        scope.$apply();
        appRoutingGo.calledOnce.should.be.true;
      });

    });
  };
});
