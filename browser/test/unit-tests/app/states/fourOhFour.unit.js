define([
  'testHelper',
  'mocks/index'
], function (helper, mocks) {

  return function () {
    describe('fourOhFour', function () {
      // var $injector;
      var $rootScope;
      var $controller;
      var $httpBackend;
      var $q;
      var $timeout;
      var appRouting;
      var $window;

      var mlSearch;
      var allTagsDialog;
      var scope;
      var updateQueryParamsStub;
      var backStub = sinon.stub();


      beforeEach(function (done) {
        angular.mock.module('app');
        module(function ($provide) {
          $provide.factory('$window', function () {
            return {
              history: { back: backStub }
            };
          });
        });
        inject(
          function (
            _$controller_,
            _$httpBackend_,
            _$rootScope_,
            _$window_
          ) {
            // $injector = _$injector_;
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $window = _$window_;
            // $timeout = _$timeout_;
            $rootScope = _$rootScope_;
            // mlSearch = _mlSearch_;
            // appRouting = _appRouting_;
            // allTagsDialog = _allTagsDialog_;

            scope = $rootScope.$new();
            // scope.setPageTitle = sinon.spy();

            done();
          }
        );
      });

      describe('fourOhFourCtlr', function () {
        var ctlr;
        it('should enable returning to previous page in history', function () {
          ctlr = $controller('fourOhFourCtlr', { $scope: scope });
          scope.goBack();
          backStub.calledOnce.should.be.true;
        });
      });

    });
  };
});
