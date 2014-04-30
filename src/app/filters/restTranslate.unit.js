describe('filters/restTranslate', function() {
  var sut;

  var ourStyle = {
    id: 1,
    title: 'Gettysburg Address',
    body: 'Four score and seven...',
    date: new Date('1863-11-19T08:00:00.000Z'),
    rating: 9.999
  };

  var serverStyle = {
    id: 1,
    name: 'Gettysburg Address',
    point: 'Four score and seven...',
    startDate: '1863-11-19T08:00:00.000Z',
    doubleValue: 9.999
  };

  beforeEach(function() {
    angular.mock.module('app');
  });

  describe('toServerFilter', function() {

    it('should translate to the server\'s schema', function(done) {
      inject(
        function(toServerFilter) {
          var toServer = toServerFilter(ourStyle);
          toServer.should.eql(serverStyle);
          done();
        }
      );
    });

  });

  describe('fromServerFilter', function() {

    it('should translate from the server\'s schema', function(done) {
      inject(
        function(fromServerFilter) {
          var fromServer = fromServerFilter(serverStyle);
          fromServer.should.eql(ourStyle);
          done();
        }
      );
    });

  });
});
