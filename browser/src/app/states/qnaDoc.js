define(['app/module'], function (module) {

  module.controller('qnaDocCtlr', [

    '$scope',
    'marked',
    'appRouting',
    'ssQnaDoc',
    'ssAnswer',
    'ssComment',
    function (
      $scope,
      marked,
      appRouting,
      ssQnaDoc,
      ssAnswer,
      ssComment
    ) {

      $scope.setLoading(true);

      var init = function () {
        var doc = ssQnaDoc.getOne(
          { id: appRouting.params.id },
          // by passing a contributorId we instigate the getting
          // and availability of hasVoted properties on the content
          // objects
          $scope.store.session ? $scope.store.session.id : null
        );
        doc.$ml.waiting.then(
          function () {
            $scope.doc = doc;
            $scope.setLoading(false);
            $scope.canVoteQuestion = function () {
              if (!$scope.store.session) {
                return false;
              }
              return $scope.doc.hasVoted !== true;
            };

            $scope.canVoteAnswer = function (answer) {
              if (!$scope.store.session) {
                return false;
              }
              return answer.hasVoted !== true;
            };

            $scope.showQuestionComment = false;
            $scope.showAnswerComment = [];
            angular.forEach($scope.doc.answers, function (answer, index) {
              $scope.showAnswerComment[index] = false;
            });

          },
          function (error) {
            if (error.status === 401) {
              $scope.setLocalError('Document Not Found');
            }
            else {
              throw new Error('loading qnaDoc with id ' + appRouting.params.id +
                  ': ' + JSON.stringify(error)
              );
            }
          }
        );

      };

      $scope.answersCountLabel = function () {
        var count = 0;
        if ($scope.doc  && $scope.doc.answers) {
          for (var i = 0; i < $scope.doc.answers.length; i++) {
            // don't count empty answer object used for new answer
            count += ($scope.doc.answers[i].id) ? 1 : 0;
          }
        }
        var plural = count !== 1;
        return count + (plural ? ' Answers' : ' Answer');
      };

      $scope.marked = function (text) {
        return marked(text);
      };

      $scope.setQueryText = function (text) {
        appRouting.go('^.explore', { q: $scope.searchbarText });
      };

      $scope.saveAnswer = function (answer) {
        if (answer.$ml.valid) {
          answer.post().$ml.waiting.then(function () {
            // Create new empty answer object for answer form
            $scope.doc.addAnswer({}, $scope.doc);
          },
          function (error) {
            if (error.status === 401) {
              $scope.setLocalError(
                'User does not have permission to answer questions'
              );
            }
            else {
              throw new Error('Error occurred: ' + JSON.stringify(error));
            }
          });
        }
      };

      $scope.saveQuestionComment = function (comment) {
        if (comment.$ml.valid) {
          comment.post().$ml.waiting.then(function () {
            $scope.doc.addComment({}, $scope.doc);
            // Show link and hide form
            $scope.showQuestionComment = false;
          },
          function (error) {
            if (error.status === 401) {
              $scope.setLocalError(
                'User does not have permission to post comments'
              );
            }
            else {
              throw new Error('Error occurred: ' + JSON.stringify(error));
            }
          });
        }
      };

      $scope.saveAnswerComment = function (comment) {
        if (comment.$ml.valid) {
          var formIndex = this.$parent.$index;
          comment.post().$ml.waiting.then(function () {
            comment.$ml.parent.addComment({}, comment.parent);
            // Show link and hide form
            $scope.showAnswerComment[formIndex] = false;
          },
          function (error) {
            if (error.status === 401) {
              $scope.setLocalError(
                'User does not have permission to post comments'
              );
            }
            else {
              throw new Error('Error occurred: ' + JSON.stringify(error));
            }
          });
        }
      };

      $scope.setPageTitle('doc');
      $scope.searchbarText = appRouting.params.q ? appRouting.params.q : null;
      init();

    }

  ]);

});
