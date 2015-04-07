/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

define([
  'mocks/index'
], function (mocks) {
  return function () {
    describe('ssAnswer', function () {
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

      // Qna doc to which we will add an answer
      var validQnaDoc = angular.copy(mocks.question);
      delete validQnaDoc.answers;

      // Answer for testing
      var validAnswer = {
        text: mocks.question.answers[0].text
      };

      // Comment for testing
      var validComment = {
        text: mocks.question.answers[0].comments[0].text
      };

      it(
        'on creation, ssAnswer parent param should be an ssQnaDoc object',
        function () {
          var qnaDoc = ssQnaDoc.create(validQnaDoc);
          var answer = ssAnswer.create(validAnswer, qnaDoc);
          expect(answer.$ml.parent instanceof ssQnaDoc.object).to.be.true;
        }
      );

      it(
        'on POST, answer (in parent qnaDoc) should have text and ID',
        function (done) {
          var url = '/v1/questions/' + validQnaDoc.id + '/answers';
          // Backend returns mock.question, which includes the answer
          $httpBackend.expectPOST(url).respond(200, mocks.question);
          var qnaDoc = ssQnaDoc.create(validQnaDoc);
          var answer = ssAnswer.create(validAnswer, qnaDoc);
          answer.post().$ml.waiting.then(
            function (data) {
              // Here I want to instead reference qnaDoc via answer.$ml.parent
              // But I don't have access to the answer (???)
              expect(qnaDoc.answers[0].text).to.equal(validAnswer.text);
              expect(qnaDoc.answers[0].id).to.exist;
              done();
            }
          );
          $httpBackend.flush();
        }
      );

    });
  };

});
