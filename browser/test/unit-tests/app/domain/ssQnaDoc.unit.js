define([
  'mocks/index'
], function (mocks) {

  return function () {
    describe('ssQnaDoc', function () {
      var ssQnaDoc;
      var $httpBackend;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (_$httpBackend_, _ssQnaDoc_) {
            ssQnaDoc = _ssQnaDoc_;
            $httpBackend = _$httpBackend_;
            done();
          }
        );
      });

      var validQnaDocText = {
        text: mocks.question.text
      };

      var validHasVoted = mocks.hasVoted;

      it(
        'on POST, Qna doc should receive expected properties',
        function (done) {
          $httpBackend.expectPOST('/v1/questions').respond(200, mocks.question);
          var doc = ssQnaDoc.create(validQnaDocText);
          doc.post().$ml.waiting.then( // confused about waiting()
            function () {
              expect(doc.text).to.equal(mocks.question.text);
              expect(doc.id).to.exist;
              done();
            }
          );
          // test instead of body?
          // test tags
          // test data created
          // test for 201 status
          // chai deep equal
          // use real object from endpoint for testing
          $httpBackend.flush();
        }
      );

      it(
        'on getOne, Qna doc should receive expected properties',
        function (done) {
          // GET ssHasVoted (request happens first, so define first)
          var url = '/v1/hasVoted?contributorId=' + mocks.question.owner.id +
                '&questionId=' + mocks.question.id;
          $httpBackend.expectGET(url).respond(200, validHasVoted);
          // GET ssQnaDoc ()
          $httpBackend.expectGET('/v1/questions/' + mocks.question.id)
            .respond(200, mocks.question);
          var doc = ssQnaDoc.getOne(
            { id: mocks.question.id },
            mocks.question.owner.id
          );
          doc.$ml.waiting.then(
            function () {
              // Check question ID property
              expect(doc.id).to.equal(mocks.question.id);
              // Check hasVoted hash
              var hasVotedID = validHasVoted[0];
              expect(doc.$ml.hasVoted.voteIds[hasVotedID]).to.equal(true);
              done();
            }
          );
          $httpBackend.flush();
        }
      );

    });
  };

});
