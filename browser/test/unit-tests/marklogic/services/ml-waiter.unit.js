(function (undefined) {

  var should = this.should;
  var stubDefer = this.testHelper.stubPromiseDeferred;
  var stubObj = {
    dummy: function () {}
  };

  describe('marklogic/services/waiter', function () {

    var sut;
    var $q;
    var $rootScope;
    var $timeout;

    beforeEach(function (done) {
      module('marklogic.svc.waiter');
      inject(
        function ($injector,_$timeout_, _$q_, mlWaiter) {
          $q = _$q_;
          $timeout = _$timeout_;
          sut = mlWaiter;
          $rootScope = $injector.get('$rootScope');
          $rootScope.model = {};
          done();
        }
      );
    });

    it('should take a promises and resolve it', function (done) {
      var h = {};
      var stub = stubDefer($q, stubObj, 'dummy', h);
      sut.waitFor(stubObj.dummy(), $rootScope.model);
      $rootScope.model.$mlWaiting.should.eq.true;
      should.not.exist($rootScope.model.$mlError);
      h.deferred.resolve(1);
      $timeout.flush();
      should.not.exist($rootScope.model.$mlWaiting);
      should.not.exist($rootScope.model.$mlError);
      $rootScope.model.should.have.property('value', 1);
      done();
    });
  });


}).call(global);

