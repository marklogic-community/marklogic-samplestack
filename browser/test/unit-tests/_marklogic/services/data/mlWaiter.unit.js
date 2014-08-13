define(['testHelper'], function (testHelper) {

  return function () {
    describe('mlWaiter', function () {
      var $q;
      var mlWaiter;
      var $timeout;

      beforeEach(function (done) {
        angular.mock.module('_marklogic');
        inject(
          function (_mlWaiter_, _$q_, _$timeout_) {
            mlWaiter = _mlWaiter_;
            $q = _$q_;
            $timeout = _$timeout_;
            done();
          }
        );
      });

      it('should enable the tracking of promise success', function (done) {
        var obj = {};
        var waiter = mlWaiter.waitOn(obj);
        obj.$ml.waiting.should.exist;
        obj.$ml.should.not.have.property('error');
        obj.$ml.waiting.then(
          function () {
            obj.$ml.should.not.have.property('error');
            obj.$ml.should.not.have.property('wating');
            expect(obj.value).to.equal(1);
            done();
          }
        );
        obj.value = 1;
        waiter.resolve();
        $timeout.flush();
      });

      it('should enable the tracking of promise failure', function (done) {
        var obj = {};
        var waiter = mlWaiter.waitOn(obj);
        obj.$ml.waiting.should.exist;
        obj.$ml.should.not.have.property('error');
        obj.$ml.waiting.catch(
          function () {
            obj.$ml.should.not.have.property('wating');
            obj.$ml.error.should.equal('because');
            obj.should.not.have.property('value');
            done();
          }
        );
        waiter.reject('because');
        $timeout.flush();
      });
    });
  };

});
