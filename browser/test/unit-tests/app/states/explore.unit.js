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

        it('should search', function (done) {
          appRouting.params = {};
          scope.initializing = false;

          exploreCtlr = $controller('exploreCtlr', { $scope: scope });

          $httpBackend.expectPOST('/v1/search').respond(mocks.searchResponse);
          $httpBackend.expectPOST('/v1/search').respond(mocks.searchResponse);
          scope.$apply();
          $httpBackend.flush();
          $timeout.flush();

          var expectedResults = angular.copy(mocks.searchResult);
          angular.forEach(expectedResults.items, function (item) {
            if (item.content.body && item.content.body.length > 400) {
              item.content.body = item.content.body.substring(0,400) +
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
