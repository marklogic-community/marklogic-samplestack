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
   * @name qnaDocCtlr
   * @description
   * Controller for the ask root.layout.qnaDoc ui-router state, which
   * displays a Samplestack question and its associated answers and
   * comments. Upon instantiation of the controller, an ssQnaDoc for
   * the question is created based on an ID parameter. The answers and
   * comments are represented by ssAnswer and ssComment sub-objects
   * of ssQnaDoc. The view also displays voting history information
   * and authenticated users can cast votes and accept answers.
   *
   * @param {angular.Scope} $scope (injected)
   * @param {object} $timeout (injected)
   * @param {object} marked For parsing and displaying markdown content.
   * @param {object} appRouting (injected)
   * @param {object} ssQnaDoc Question model object.
   * @param {object} ssAnswer Answer model object.
   * @param {object} ssComment Comment model object.
   * @param {object} ssVote Vote model object.
   * @param {object} ssAcceptedAnswer Accepted answer model object.
   *
   * @property {boolean} $scope.setLoading Flag set to true when page
   * data is loading.
   * @property {ssQnaDoc} $scope.doc The document object to be displayed.
   * @property {boolean} $scope.showQuestionComment Flag set to true
   * when question comment form should be displayed.
   * @property {Array.<object>} $scope.showAnswerComment Array of objects,
   * one per answer, that determine whether to display an answer comment
   * form.
   * @property {object} $scope.draftAnswer A draft object for new answers.
   */
  module.controller('qnaDocCtlr', [

    '$scope',
    '$timeout',
    'marked',
    'appRouting',
    'ssQnaDoc',
    'ssAnswer',
    'ssComment',
    'ssVote',
    'ssAcceptedAnswer',
    function (
      $scope,
      $timeout,
      marked,
      appRouting,
      ssQnaDoc,
      ssAnswer,
      ssComment,
      ssVote,
      ssAcceptedAnswer
    ) {

      $scope.setLoading(true);

      var init = function () {
        var doc = ssQnaDoc.getOne(
          { id: appRouting.params.id },
          // by passing a contributorId we instigate the getting
          // and availability of voting properties on the content
          // objects [TODO Is this still relevant since /hasVoted
          // endpoint is now gone?]
          $scope.store.session ? $scope.store.session.id : null
        );
        doc.$ml.waiting.then(
          function () {
            $scope.doc = doc;
            $scope.setLoading(false);

            if (appRouting.params['content-id']) {
              $timeout(function () {
                appRouting.scroll(
                  angular.element(document.getElementById(
                    'ss-content-id-' + appRouting.params['content-id']
                  ))
                );
              });
            }

            $scope.showQuestionComment = false;
            $scope.showAnswerComment = [];
            angular.forEach($scope.doc.answers, function (answer, index) {
              $scope.showAnswerComment[index] = false;
            });

            $scope.draftAnswer = ssAnswer.create({}, $scope.doc);

          },
          function (error) {
            // so the layout can stop showing its spinner
            $scope.setLoading(false);
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

      // Handle search queries from the search bar
      $scope.$on('setQueryText', function (evt, arg) {
        appRouting.go('root.layout.explore.results', {
          q: $scope.dasherize(arg.queryText)
        });
      });

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.canVoteOn
      * @description Returns whether current user can vote on the object.
      * Votes can be cast on questions and answers.
      * @param {object} obj A ssQnaDoc object or ssAnswer object
      * @returns {boolean} true or false
      */
      $scope.canVoteOn = function (obj) {
        if (!$scope.store.session) {
          return false;
        }
        else {
          return !obj.downvotingContributorIds[$scope.store.session.id] &&
            !obj.upvotingContributorIds[$scope.store.session.id];
        }
      };

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.hasVotedUp
      * @description Returns whether current user has upvoted the object
      * @param {object} obj A ssQnaDoc object or ssAnswer object
      * @returns {boolean} true or false
      */
      $scope.hasVotedUp = function (obj) {
        // guests cannot vote
        if (!$scope.store.session) {
          return false;
        }
        // check for upvote
        else {
          return obj.upvotingContributorIds[$scope.store.session.id];
        }
      };

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.hasVotedDown
      * @description Returns whether current user has downvoted the object
      * @param {object} obj A ssQnaDoc object or ssAnswer object
      * @returns {boolean} true or false
      */
      $scope.hasVotedDown = function (obj) {
        // guests cannot vote
        if (!$scope.store.session) {
          return false;
        }
        // check for downvote
        else {
          return obj.downvotingContributorIds[$scope.store.session.id];
        }
      };

      $scope.tooltipUpFor = function (contentObj) {
        if ($scope.canVoteOn(contentObj)) {
          return 'Vote this up';
        }
        else {
          if ($scope.store.session) {
            return 'You cannot change your vote';
          }
          else {
            return 'You must be logged in to vote';
          }
        }
      };

      $scope.tooltipDownFor = function (contentObj) {
        if ($scope.canVoteOn(contentObj)) {
          return 'Vote this down';
        }
        else {
          if ($scope.store.session) {
            return 'You cannot change your vote';
          }
          else {
            return 'You must be logged in to vote';
          }
        }
      };

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.canAcceptAnswer
      * @description Returns whether current user can accept
      * an answer associated with the QnaDoc.
      * @param {ssAnswer} answer The ssAnswer object.
      * @returns {boolean} true or false
      */
      $scope.canAcceptAnswer = function (answer) {
        if (!$scope.store.session) {
          return false;
        }
        return $scope.store.session.userInfo.id === $scope.doc.owner.id;
      };

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.canAnswer
      * @description Returns whether current user can submit
      * an answer to the QnaDoc.
      * @param {ssAnswer} answer The ssAnswer object.
      * @returns {boolean} true or false
      */
      $scope.canAnswer = function (answer) {
        return $scope.store.session;
      };

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.answersCountLabel
      * @description Returns a singular or plural answers label based on
      * the number of answers.
      * @returns {string} A label
      */
      $scope.answersCountLabel = function () {
        var len = $scope.doc.answers.length;
        return len + (len === 1 ? ' Answer' : ' Answers');
      };

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.marked
      * @description Parses markdown-formatted text.
      * @param {string} text Text to be parsed.
      * @returns {string} Parsed text
      */
      $scope.marked = function (text) {
        return marked(text);
      };

      $scope.setQueryText = function (text) {
        appRouting.go('^.explore', { q: $scope.searchbarText });
      };

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.saveAnswer
      * @description Saves an answer if valid.
      * @param {ssAnswer} answer Answer to be saved.
      */
      $scope.saveAnswer = function (answer) {
        if (answer.$ml.valid) {
          answer.post().$ml.waiting.then(
            function () {
              // Create new empty answer object for answer form
              $scope.draftAnswer = ssAnswer.create({}, $scope.doc);
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
            }
          );
        }
      };

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.saveQuestionComment
      * @description Saves a question comment if valid.
      */
      $scope.saveQuestionComment = function () {
        var comment = $scope.doc.comments.draft;
        if (comment.$ml.valid) {
          comment.post().$ml.waiting.then(function () {
            delete $scope.doc.comments.draft;
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

     /**
      * @ngdoc method
      * @name qnaDocCtlr#$scope.saveAnswerComment
      * @description Saves an answer comment if valid.
      */
      $scope.saveAnswerComment = function (answer) {
        var comment = answer.comments.draft;
        if (comment.$ml.valid) {
          var formIndex = this.$parent.$index;
          comment.post().$ml.waiting.then(function () {
            delete answer.comments.draft;
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

      $scope.updateReputation = function (item) {
        if (item.owner.id === $scope.store.session.id) {
          // be careful here -- the existing item is dead, having been
          // reinstantiated; all we know is that we need to check the current
          // items for new value

          var objs = $scope.doc.answers.slice(0);
          objs.unshift($scope.doc);
          _.forEach(objs, function (obj) {
            if (obj.owner.id === $scope.store.session.id) {
              $scope.store.session.userInfo.reputation = obj.owner.reputation;
              return false;
            }
          });
        }
      };

      $scope.vote = function (val, item) {
        if ($scope.canVoteOn(item)) {
          item.vote(val, $scope.store.session.userInfo)
          .then(function () {
            $scope.updateReputation(item);
          });
        }
      };

      $scope.accept = function (answer) {
        answer.accept()
        .then(function () {
          $scope.updateReputation(answer);
        });
      };

      $scope.setPageTitle('doc');

      // clear searchbar text when a qnaDoc is viewed
      $scope.searchbarText = null;

      init();

      $scope.addComment = function (contentObj) {
        contentObj.comments.draft = ssComment.create({}, contentObj);
      };

    }

  ]);

  module.animation('.ss-answer-wrapper', function () {
    return {
      move : function (element, done) {
        window.jQuery('body, html').animate(
          { scrollTop: element.offset().top },
          { done: done, duration: 500 }
        );
      }
    };
  });
});
