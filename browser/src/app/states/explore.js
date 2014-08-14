define(['app/module','mocks/index'], function (module,mocksIndex) {

  /**
   * @ngdoc state
   * @name explore
   *
   * @description
   * TBD
   *
   */

  module.controller('exploreCtlr', [

    '$scope',
    '$parse',
    '$window',
    '$log',
    '$q',
    'appRouting',
    'ssSearch',
    'allTagsDialog',
    function (
      $scope,
      $parse,
      $window,
      $log,
      $q,
      appRouting,
      ssSearch,
      allTagsDialog
    ) {

      $scope.setLoading(true);

      var dasherize = function (str) {
        return str && str.length ?
          str.trim()
            .replace(/-/g, '%2D')
            .replace(/ /g, '-') :
          null;
      };

      var dedasherize = function (str) {
        return str && str.length ?
          str.trim()
            .replace(/-/g, ' ')
            .replace(/%2D/g, '-')
            .trim() :
          null;
      };

      var runSearch = function () {
        var newStateParams = $scope.search.getStateParams();
        if (newStateParams.q) {
          newStateParams.q = dasherize(newStateParams.q);
        }
        appRouting.updateQueryParams(newStateParams);

        $log.debug('searching at ' + new Date().toISOString());

        var shadowConstraints = ['tags'];
        $scope.search.go(shadowConstraints, ssSearch).then(
          function () {
            if ($scope.search.pageOutOfBounds()) {
              $scope.search.setPageInBounds();
              runSearch();
              return;
            }
            $scope.search.results.items.forEach(function (item) {
              if (item.content.body && item.content.body.length > 400) {
                item.content.body = item.content.body.substring(0,400) +
                    '...';
              }
            });

            if (!handlersSet) {
              setHandlers();
            }

            $scope.setLoading(false);
          },
          function (reason) {
            throw new Error(
              JSON.stringify(reason),
              'ssSearch:post'
            );
          }
        );
      };

      $scope.setPageTitle('explore');

      var handleParams = function () {
        var params = angular.copy(appRouting.params);
        if (params.q) {
          dedasherize(params.q);
        }
        var search = ssSearch.create();
        search.assignStateParams(params);
        $scope.search = search;

        $scope.searchbarText = $scope.search.criteria.q;
        $scope.showMineOnly = Boolean(
          $parse('search.criteria.constraints.userName.value')($scope) &&
          $scope.store.session
        );
        var resolvedOnly =
            $parse('search.criteria.constraints.resolved.value')($scope);
        if ($scope.store.session) {
          $scope.resolvedOnly = (resolvedOnly === true);
        }
      };
      handleParams();


      var handlersSet = false;
      var setHandlers = function () {
        $scope.$watch(
          'search.criteria',
          function (newVal, oldVal) {
            if (newVal !== oldVal) {
              // TODO what if the user *didn't* want to apply the search bar
              // text? The ux needs to be considered
              $scope.search.criteria.q = $scope.searchbarText;
              runSearch();
            }
          },
          true
        );

        $scope.$watch(
          'store.session.id',
          function (newVal, oldVal) {
            if (newVal !== oldVal) {
              $scope.search.criteria.constraints.resolved.value = null;
              $scope.resolvedOnly = false;
              $scope.search.criteria.q = $scope.searchbarText;
            }
          }
        );

        $scope.$watch(
          'showMineOnly',
          function (newVal, oldVal) {
            if (newVal !== oldVal) {
              if (newVal && $scope.store.session) {
                $scope.search.criteria.constraints.userName.value =
                    $scope.store.session.userInfo.userName;
              }
              else {
                $scope.search.criteria.constraints.userName.value = null;
              }
            }
          }
        );

        $scope.$watch(
          'resolvedOnly',
          function (newVal, oldVal) {
            if (newVal === true) {
              $scope.search.criteria.constraints.resolved.value = true;
            }
            else {
              $scope.search.criteria.constraints.resolved.value = null;
            }
          }
        );
        handlersSet = true;
      };

      $scope.setQueryText = function () {
        $scope.search.criteria.q = $scope.searchbarText;
      };

      if ($scope.initializing) {
        $scope.initializing.then(function () {

          $scope.$watch('store.session.id', function (newVal, oldVal) {
            if (newVal !== oldVal) {

              if (!newVal) {
                $scope.showMineOnly = false;
              }
              runSearch();
            }
          });

          if (!$scope.store.session) {
            $scope.showMineOnly = false;
            $scope.search.criteria.constraints.userName.value = null;
          }
          runSearch();
        });
      }
      else {
        runSearch();
      }

      $scope.clearTagsConstraint = function () {
        $scope.search.criteria.constraints.tags.values = [];
      };

      $scope.openAllTags = function () {
        // Open dialog and pass in tags
        var dialogResult = allTagsDialog(
          angular.copy($scope.unselTags),
          angular.copy($scope.selTags)
        );

        dialogResult.result.then(
          // On success, save tag state based on selection in dialog
          function (data) {
            $scope.unselTags = data.unselTags;
            $scope.selTags = data.selTags;
            // cheapy hack for now
            $scope.$emit('tagsChange', { tags: $scope.selTags });
          }
        );

      };

    }

  ]);

});
