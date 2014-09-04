define([
  'testHelper'
], function (helper) {

  return function () {
    describe('appRouting', function () {
      var ctlr;
      var el;
      var scope;
      var $timeout;
      var $httpBackend;
      var appRouting;

      describe('hash-mode routing', function () {
        it(
          'should be ok with hash-mode routing if configured so',
          function (done) {
            module('app');
            module(function (appRoutingProvider) {
              appRoutingProvider.forceHashMode();
            });
            inject(function (
              $location,
              $rootScope,
              appRouting,
              $httpBackend
            ) {
              $location.path('/');
              $httpBackend.expectGET('/app/states/_root.html')
                  .respond(200);
              $httpBackend.expectGET('/app/states/_layout.html')
                  .respond(200);
              $httpBackend.expectGET('/app/states/explore.html')
                  .respond(200);
              $httpBackend.expectGET('/app/states/exploreResults.html')
                  .respond(200);

              $rootScope.$apply();
              $httpBackend.flush();
              $location.absUrl().indexOf('#')
                  .should.be.greaterThan(-1);
              done();
            });
          }
        );
      });
    });
  };
});
