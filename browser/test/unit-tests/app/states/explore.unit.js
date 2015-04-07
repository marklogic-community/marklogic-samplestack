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
  'mocks/index'
], function (helper, mocks) {

  return function () {
    describe('explore', function () {
      // var $injector;
      var $rootScope;
      var $controller;
      var $httpBackend;
      var $q;
      var $timeout;
      var appRouting;

      var mlSearch;
      var allTagsDialog;
      var scope;
      var updateQueryParamsStub;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (
            _$controller_,
            _$httpBackend_,
            _$timeout_,
            _$rootScope_,
            _appRouting_,
            _mlSearch_,
            _allTagsDialog_
          ) {
            // $injector = _$injector_;
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            $rootScope = _$rootScope_;
            mlSearch = _mlSearch_;
            appRouting = _appRouting_;
            allTagsDialog = _allTagsDialog_;

            scope = $rootScope.$new();
            scope.setLoading = function () {};
            scope.setPageTitle = sinon.spy();
            scope.store = {};

            $httpBackend.whenGET('/app/states/_root.html')
                .respond(200);
            $httpBackend.whenGET('/app/states/_layout.html')
                .respond(200);
            $httpBackend.whenGET('/app/states/explore.html')
                .respond(200);
            done();
          }
        );
      });

      describe('exploreCtlr', function () {
        var exploreCtlr;
        it('should set page title', function () {
          exploreCtlr = $controller('exploreCtlr', { $scope: scope });
          scope.setPageTitle.should.have.been.calledWith('explore');
        });

        xit('should search', function (done) {
          this.timeout(300);
          appRouting.params = {};
          scope.initializing = false;

          exploreCtlr = $controller('exploreCtlr', { $scope: scope });

          $httpBackend.expectPOST('/v1/search').respond(mocks.searchResponse);
          $httpBackend.expectPOST('/v1/search').respond(mocks.searchResponse);
          $httpBackend.expectPOST('/v1/search').respond(mocks.searchResponse);
          scope.$apply();
          $timeout.flush();
          $httpBackend.flush();
          $timeout.flush();

          var expectedResults = angular.copy(mocks.searchResult);
          angular.forEach(expectedResults.items, function (item) {
            if (item.content.text && item.content.text.length > 400) {
              item.content.text = item.content.text.substring(0,400) +
                  '...';
            }
          });
          // TODO: come back to the mocks and deal with the fact that
          // we are overriding a bunch of values from the server to format
          // the object for javascript usage
          scope.search.results.should.be.ok; //deep.equal(expectedResults);
          done();
        });
      });

    });
  };
});
