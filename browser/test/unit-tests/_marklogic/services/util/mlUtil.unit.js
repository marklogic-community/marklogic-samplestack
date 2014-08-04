define(['testHelper'], function (helper) {

  return function () {

    describe('mlUtil', function () {
      var mlUtil;

      beforeEach(function (done) {
        angular.mock.module('_marklogic');
        inject(
          function (
            _mlUtil_
          ) {
            mlUtil = _mlUtil_;
            done();
          }
        );
      });

      describe('merge', function () {
        it('should enabled merge of objects', function () {
          var x = { a: { b: { c: 2, d: [ 1, 2, 3 ] } } };

          var y = { a: { b1: { c: 2, d: [ 4 ] } } };

          var z = mlUtil.merge(x, y);
          x.should.deep.equal(
            { a: { b: { c: 2, d: [ 1, 2, 3 ] }, b1: { c: 2, d: [4 ]} } }
          );

        });
      });

    });
  };

});
