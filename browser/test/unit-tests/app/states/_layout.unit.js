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

          ctlr = $controller(
            'layoutCtlr', { $scope: scope }
          );
          $httpBackend.flush();
          done();
        });
      });

      it('enables asking a question when logged in', function () {
        scope.store = { session: {} };
        var appRoutingGo = sinon.stub(appRouting, 'go');
        angular.element(
          el[0].querySelector('.ss-ask-button')
        ).click();
        scope.$apply();
        appRoutingGo.calledOnce.should.be.true;
      });

    });
  };
});
