describe('app/filters/point', function () {
  var sut;

  beforeEach(function () {
    module('app');
  });

  describe('toPointFilter', function () {

    beforeEach(function (done) {
      inject(
        function (toPointFilter) {
          sut = toPointFilter;
          done();
        }
      );
    });

    it('should parse a string using parens to a point', function () {
      sut('(3,2.8)').should.eql([3,2.8]);
    });

    it('should parse a string using brackets to a point', function () {
      sut('[0xF,70)').should.eql([15,70]);
    });

  });

  describe('fromPointFilter', function () {

    beforeEach(function (done) {
      inject(
        function (fromPointFilter) {
          sut = fromPointFilter;
          done();
        }
      );
    });

    it('should convert a point to a string', function () {
      sut([3,2.8]).should.eql('[3,2.8]');
    });

  });
});
