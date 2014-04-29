define(['testHelper', './oldDocs'], function(helper, sut) {

  describe('states/oldDocs', function() {
    describe(':controller', function() {
      var testable;
      var stub;
      var getDocsResponse = 'hello';
      var $timeout;

      beforeEach(function(done) {
        angular.mock.module('app');
        inject(
          function($injector, $q, docs, _$timeout_) {
            stub = helper.stubPromise($q, docs, 'getDocs', getDocsResponse);
            testable = helper.getTestableController(
              $injector,
              sut
            );
            $timeout = _$timeout_;
            done();
          }
        );
      });

      it('should have the expteded value in the model', function() {
        $timeout.flush();
        testable.$scope.docs.should.equal(getDocsResponse);
      });

    });

  });

});
