define(['app/module'], function (module) {

  module.controller('askCtlr', [

    '$scope', 'appRouting', 'ssQnaDoc',
    function ($scope, appRouting, ssQnaDoc) {

      $scope.setPageTitle('ask');

      ssQnaDoc.create().attachScope($scope, 'qnaDoc');

      $scope.tagsInput; // store tags-input data

      $scope.save = function () {

        // convert tags-input data from array of objects to array of strings
        $scope.qnaDoc.tags = $scope.tagsInput.map(function (obj) {
          return obj.text;
        });

        // Remove empty answer and comments (used for UI forms on QnaDoc page)
        delete $scope.qnaDoc.answers;
        delete $scope.qnaDoc.comments;

        if ($scope.qnaDoc.$ml.valid) {
          $scope.qnaDoc.post().$ml.waiting.then(function () {
            appRouting.go('^.qnaDoc', {id: $scope.qnaDoc.id});
          },
          function (error) {
            if (error.status === 401) {
              $scope.setLocalError(
                'User does not have permission to ask questions'
              );
            }
            else {
              throw new Error('Error occurred: ' + JSON.stringify(error));
            }
          });
        }

      };

    }

  ]);

});
