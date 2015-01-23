define(['app/module'], function (module) {

  module.controller('askCtlr', [

    '$scope', 'appRouting', 'ssQnaDoc', 'ssTagsSearch',
    function ($scope, appRouting, ssQnaDoc, ssTagsSearch) {

      $scope.setPageTitle('ask');

      ssQnaDoc.create().attachScope($scope, 'qnaDoc');

      $scope.tagsInput; // store tags-input data

      var tagsSearch = ssTagsSearch.create({
        criteria: {
          tagsQuery: {
            start: 1,
            pageLength: 100,
            sort: 'frequency',
            forTag: ' '
          }
        }
      });

      $scope.loadTags = function (query) {
        tagsSearch.criteria.tagsQuery.forTag = query;
        return tagsSearch.post().$ml.waiting
          .then(function (response) {
            var tagsArr = [];
            angular.forEach(response.results.items, function (value, key) {
              tagsArr.push({'text': value.name + ' (' + value.count + ')'});
            });
            return tagsArr;
          });
      };

      // Remove trailing freq in parens
      $scope.parseTag = function (tag) {
        tag.text = tag.text.substring(0, tag.text.indexOf('-('));
        return tag;
      };

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
