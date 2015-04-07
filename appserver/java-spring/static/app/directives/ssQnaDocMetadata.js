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

  /*
   * @ngdoc directive
   * @name ssQnaDocMetadata
   * @restrict E
   * @description
   * Directive for displaying metadata in QnA document view. Provides helper
   * functions used to generate the UI element content.
   *
   * <p style="color: red">complete me with scope vars</p>
   */

  module.directive('ssQnaDocMetadata', [

    'mlUtil',
    'appRouting',
    function (
      mlUtil,
      appRouting
    ) {
      return {
        restrict: 'E',
        templateUrl: '/app/directives/ssQnaDocMetadata.html',
        scope: {
          doc: '=doc',
          docType: '@docType'
        },
        link: function (scope) {
          var unregister = scope.$watch('doc', function (newVal, oldVal) {
            if (newVal) {
              unregister();
              // On contributor click, dispatch event to _root.js
              scope.showContributor = function () {
                scope.$emit(
                  'showContributor',
                  {
                    contributorId: scope.doc.owner.id
                  }
                );
              };
              scope.isLocalOwner = function () {
                if (scope.doc.owner) {
                  return scope.doc.owner.originalId === undefined ||
                      scope.doc.owner.originalId === null;
                }
                else {
                  return false;
                }
              };

              scope.soUserLink = function () {
                return scope.doc.owner && scope.doc.owner.originalId ?
                    'http://stackoverflow.com/users/' +
                    scope.doc.owner.originalId :
                    null;
              };

              scope.formatDate = function (date) {
                if (date) {
                  return date.format('MMM D, \'YY') +
                      ' at ' + date.format('H:mm');
                }
              };

              // Return human readable time since str date
              // http://momentjs.com/docs/#/displaying/fromnow/
              scope.formatDateRelative = function (date) {
                if (date) {
                  return date.fromNow();
                }
              };

              // Return days between now and str date
              scope.daysSince = function (date) {
                if (date) {
                  return mlUtil.moment().diff(date, 'days');
                }
              };

              // tag click sets tags critieria to that tag, clears all else
              scope.goTag = function (tag) {
                appRouting.go(
                  'root.layout.explore.results',
                  {
                    'q': null,
                    'tags': tag,
                    'resolved': null,
                    'contributor': null,
                    'date-ge': null,
                    'date-lt': null
                  }
                );
              };

            }
          });

        }
      };
    }
  ]);
});
