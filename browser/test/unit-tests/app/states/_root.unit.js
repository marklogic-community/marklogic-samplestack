define([
  'testHelper'
], function (helper) {

  return function () {
    describe('_root', function () {
      var $controller;
      var $httpBackend;
      var $rootScope;
      var $timeout;
      var scope;
      var rootCtlr;
      var deferredRestore;
      var loginDialogStub = sinon.stub();
      var contributorDialogStub = sinon.stub();

      beforeEach(function (done) {
        module('app');
        module(function ($provide) {
          $provide.factory('loginDialog', function () {
            return loginDialogStub;
          });
          $provide.factory('contributorDialog', function () {
            return contributorDialogStub;
          });

          $provide.factory('mlAuth', function ($q) {
            return {
              restoreSession: function () {
                deferredRestore = $q.defer();
                return deferredRestore.promise;
              }
            };
          });

        });
        inject(
          function (
            _$controller_,
            _$httpBackend_,
            _$rootScope_,
            _$timeout_
          ) {
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            rootCtlr = $controller('rootCtlr', { $scope: scope });
            done();
          }
        );
      });

      it('should enable to set page title', function () {
        scope.setPageTitle('test');
        scope.$apply();
        $rootScope.pageTitle.should.equal('test');
      });

      it('should enable opening login dialog', function () {
        scope.openLogin();
        scope.$apply();
        loginDialogStub.calledOnce.should.be.true;
      });

      it('should enable showing contributor dialog', function () {
        scope.$emit('showContributor', { contributorId: 1 });
        scope.$apply();
        contributorDialogStub.calledOnce.should.be.true;
      });

    });

  };
});
