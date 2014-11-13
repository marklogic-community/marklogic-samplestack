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

//       {
// title: "title of the question"
// text: "Body of the question, in markdown"
// tags: [2]
// 0:  "xquery"
// 1:  "javscript"
// -
// id: "/questions/9bd3a0ba-15ae-4957-985f-490c87f6cfe6"
// creationDate: "2014-09-11T10:44:14.92852-07:00"
// creationYearMonth: "201409"
// docScore: 0
// itemTally: 0
// comments: [0]
// answers: [0]
// owner: {
// userName: "joeUser@marklogic.com"
// id: "cf99542d-f024-4478-a6dc-7e723a51b040"
// displayName: "joeUser"
// }-
// lastActivityDate: "2014-09-11T10:44:14.92852-07:00"
// }

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
