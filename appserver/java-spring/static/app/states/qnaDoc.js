define(['app/module'], function (module) {

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
          // objects
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

      $scope.$on('setQueryText', function (evt, arg) {
        appRouting.go('root.layout.explore.results', {
          q: $scope.dasherize(arg.queryText)
        });
      });

     /**
      * @ngdoc method
      * @name $scope.canVoteOn
      * @description Returns whether current user can vote on the object
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
      * @name $scope.hasVotedUp
      * @description Returns whether current user has upvoted the object
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
      * @name $scope.hasVotedDown
      * @description Returns whether current user has downvoted the object
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

     /**
      * @ngdoc method
      * @name $scope.canAcceptAnswer
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
      * @name $scope.canAnswer
      * @description Returns whether current user can submit
      * an answer to the QnaDoc.
      * @returns {boolean} true or false
      */
      $scope.canAnswer = function (answer) {
        return $scope.store.session;
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
        answer.accept();
      };

      $scope.setPageTitle('doc');

      // clear searchbar text when a qnaDoc is viewed
      $scope.searchbarText = null;

      init();

    }

  ]);

});
