define(['app/module'], function (module) {

  module.controller('qnaDocCtlr', [

    '$scope',
    'marked',
    'appRouting',
    'ssQnaDoc',
    function (
      $scope,
      marked,
      appRouting,
      ssQnaDoc
    ) {

      $scope.setLoading(true);

      var init = function () {
        var doc = ssQnaDoc.getOne({ id: appRouting.params.id });
        doc.$ml.waiting.then(
          function () {
            $scope.doc = doc;
            $scope.setLoading(false);
            $scope.canVoteQuestion = function () {
              if (!$scope.store.session) {
                return false;
              }
              return !$scope.store.session.userInfo
                  .hasVotedOnQuestion($scope.doc);
            };

            $scope.canVoteAnswer = function (answer) {
              if (!$scope.store.session) {
                return false;
              }
              return !$scope.store.session.userInfo
                  .hasVotedOnAnswer($scope.doc, answer);
            };
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
        var count = $scope.doc  && $scope.doc.answers ?
            $scope.doc.answers.length :
            0;
        var plural = count !== 1;
        return count + (plural ? ' Answers' : ' Answer');
      };

      $scope.marked = function (text) {
        return marked(text);
      };

      $scope.setQueryText = function (text) {
        appRouting.go('^.explore', { q: $scope.searchbarText });
      };

      $scope.setPageTitle('doc');
      $scope.searchbarText = appRouting.params.q ? appRouting.params.q : null;
      init();

    }

  ]);

});
