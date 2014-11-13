define([
  'mocks/index'
], function (mocks) {
  return function () {
    describe('ssHasVoted', function () {
      var ssHasVoted;
      var $httpBackend;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (_$httpBackend_, _ssHasVoted_) {
            ssHasVoted = _ssHasVoted_;
            $httpBackend = _$httpBackend_;
            done();
          }
        );
      });

      var validHasVotes = mocks.hasVotes;
      var contributorId = '12345';
      var questionId = '67890';
      var spec = {
        contributorId: contributorId,
        questionId: questionId
      };

      it(
        'on GET, ssHasVotes should have voteIds with ID keys and true vals',
        function (done) {
          var url = '/v1/hasVoted?' +
                    'contributorId=' + contributorId +
                    '&questionId=' + questionId;
          $httpBackend.expectGET(url).respond(200, validHasVotes);
          var hasVoted = ssHasVoted.create(spec);
          hasVoted.getOne().$ml.waiting.then(
            function (data) {
              var convHasVotes = {};
              angular.forEach(validHasVotes, function (value, index) {
                convHasVotes[value] = true;
              });
              expect(hasVoted.voteIds).to.deep.equal(convHasVotes);
              done();
            }
          );
          $httpBackend.flush();
        }
      );
    });
  };

});
