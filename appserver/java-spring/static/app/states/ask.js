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

define(['app/module'], function (module) {

  /**
   * @ngdoc controller
   * @kind constructor
   * @name askCtlr
   * @description
   * Controller for the ask root.layout.ask ui-router state, which
   * provides an interface for asking a Samplestack question. Upon
   * instantiation of the controller, an ssQnaDoc object is created
   * for the new question and this object is attached to the $scope
   * as $scope.qnaDoc.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {object} appRouting (injected)
   * @param {object} ssQnaDoc The question model object.
   *
   * @property {Array.string} $scope.tagsInput An array of selected
   * tag names.
   */
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
            sort: 'name',
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
              // do not show selected tags in list
              if (!$scope.tagSelected(value)) {
                tagsArr.push({'text': value.name + ' (' + value.count + ')'});
              }
            });
            return tagsArr;
          });
      };

      // Is tag selected already?
      $scope.tagSelected = function (tag) {
        var result = false;
        angular.forEach($scope.tagsInput, function (value, key) {
          if (tag.name === value.text) {
            result = true;
          }
        });
        return result;
      };

      // Remove trailing freq in parens
      $scope.parseTag = function (tag) {
        tag.text = tag.text.substring(0, tag.text.indexOf('-('));
        return tag;
      };

      /**
       * @ngdoc method
       * @name askCtlr#$scope.save
       * @description Posts the new question to the server if the question is
       * valid, then redirects the user to the root.layout.qnaDoc view for
       * that new question. If the question is invalid, an error message is
       * displayed.
       */
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
