define([
  'mocks/index'
], function (mocks) {
  return function () {
    describe('ssComment', function () {
      var $httpBackend;
      var ssQnaDoc;
      var ssAnswer;
      var ssComment;

      beforeEach(function (done) {
        angular.mock.module('app');
        inject(
          function (_$httpBackend_, _ssQnaDoc_, _ssAnswer_, _ssComment_) {
            $httpBackend = _$httpBackend_;
            ssQnaDoc = _ssQnaDoc_;
            ssAnswer = _ssAnswer_;
            ssComment = _ssComment_;
            done();
          }
        );
      });

      // Qna doc to which we will add comments
      var validQnaDoc = angular.copy(mocks.question);
      delete validQnaDoc.comments;
      validQnaDoc.answers.forEach(function (el, i, arr) {
        delete arr[i].comments;
      });


      // Answer for testing
      var validAnswer = {
        text: mocks.question.answers[0].text
      };

      // Question comment for testing
      var validQuestionComment = {
        text: mocks.question.comments[0].text
      };

      // Answer comment for testing
      var validAnswerComment = {
        text: mocks.question.answers[0].comments[0].text
      };

      it(
        'for question comments, ssComment parent should be an ssQnaDoc object',
        function () {
          var qnaDoc = ssQnaDoc.create(validQnaDoc);
          var comment = ssComment.create(validQuestionComment, qnaDoc);
          expect(comment.$ml.parent instanceof ssQnaDoc.object).to.be.true;
        }
      );

      it(
        'for answer comments, ssComment parent should be an ssAnswer object',
        function () {
          var qnaDoc = ssQnaDoc.create(validQnaDoc);
          var answer = ssAnswer.create(validAnswer, qnaDoc);
          var comment = ssComment.create(validAnswerComment, answer);
          expect(comment.$ml.parent instanceof ssAnswer.object).to.be.true;
        }
      );

      it(
        'on POST for a question comment, comment should have text and ID',
        function (done) {
          var url = '/v1/questions/' + validQnaDoc.id + '/comments';
          // Backend returns mock.question, which includes the comment
          $httpBackend.expectPOST(url).respond(200, mocks.question);
          var qnaDoc = ssQnaDoc.create(validQnaDoc);
          var comment = ssComment.create(validQuestionComment, qnaDoc);
          comment.post().$ml.waiting.then(
            function (data) {
              expect(qnaDoc.comments[0].text).
                to.equal(validQuestionComment.text);
              expect(qnaDoc.comments[0].id).to.exist;
              done();
            }
          );
          $httpBackend.flush();
        }
      );

      it(
        'on POST for an answer comment, comment should have text and ID',
        function (done) {
          var url = '/v1/questions/' +
                    validQnaDoc.id + '/answers/' +
                    validQnaDoc.answers[0].id + '/comments';
          // Backend returns mock.question, which includes the comment
          $httpBackend.expectPOST(url).respond(200, mocks.question);
          var qnaDoc = ssQnaDoc.create(validQnaDoc);
          var comment = ssComment.create(validAnswerComment, qnaDoc.answers[0]);
          comment.post().$ml.waiting.then(
            function (data) {
              expect(qnaDoc.answers[0].comments[0].text).
                to.equal(validAnswerComment.text);
              expect(qnaDoc.answers[0].comments[0].id).to.exist;
              done();
            }
          );
          $httpBackend.flush();
        }
      );

    });
  };

});
