define(['app/module'], function (module) {

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
    '$timeout',
    'appRouting',
    'ssSearch',
    'allTagsDialog',
    function (
      $scope,
      $timeout,
      appRouting,
      ssSearch,
      allTagsDialog
    ) {
      // after everything is arranged, this function is called to initialize
      // the state
      var init = function () {
        $scope.setPageTitle('explore');

        // while we haven't finished loading, say so
        $scope.setLoading(true);

        $scope.search = ssSearch.create();

        setWatches();
      };

      var sortOverride = function () {
        if (
          $scope.search.criteria.sort &&
          $scope.search.criteria.sort[0] === 'relevance' &&
          (!($scope.search.criteria.q && $scope.search.criteria.q.length))
        ) {
          delete $scope.search.criteria.sort;
        }
      };

      var setWatches = function () {
        var onChange = function (newVal, oldVal) {
          if (newVal !== oldVal) { $scope.$emit('criteriaChange'); }
        };

        $scope.$watch(
          'search.criteria.q', onChange
        );
        $scope.$watch(
          'search.criteria.sort', onChange
        );
        $scope.$watch(
          'search.criteria.constraints.userName.value', onChange
        );
        $scope.$watch(
          'search.criteria.constraints.resolved.value', onChange
        );
      };

      $scope.applyScopeToSearch = function () {
        $scope.search.criteria.constraints.userName.value =
            $scope.showMineOnly === true ?
              $scope.store.session.userInfo.userName :
              null;
        $scope.search.criteria.constraints.resolved.value =
            $scope.resolvedOnly === true ? true : null;
        $scope.search.criteria.q = $scope.searchbarText;
      };

      $scope.applySearchToScope = function () {
        // showMineOnly only if the user is a contributor AND they have
        // specified it in the url. see also setShowMineOnly and
        // showMineOnlyEnabled
        $scope.showMineOnly = ($scope.showMineOnlyEnabled() &&
            $scope.search.criteria.constraints.userName.value) ? true : null;

        // IF there is a session, set resolved only if they have specified
        // it in the url.  see also setResolvedOnly and resolvedOnly enabled
        if ($scope.resolvedOnlyEnabled()) {
          $scope.resolvedOnly =
              $scope.search.criteria.constraints.resolved.value === true;
        }

        $scope.searchbarText = $scope.search.criteria.q;
      };


      // these inputs are only enabled for contributors
      $scope.showMineOnlyEnabled = $scope.resolvedOnlyEnabled = function () {
        return $scope.store.session;
      };

      $scope.onCriteriaChange = function () {
        sortOverride();
        $scope.applyScopeToSearch();
        var newStateParams = $scope.search.getStateParams();
        if (newStateParams.q) {
          newStateParams.q = $scope.dasherize(newStateParams.q);
        }
        appRouting.updateQueryParams(newStateParams);
      };

      $scope.$on('setQueryText', $scope.onCriteriaChange);

      // whenever criteria changes, go to the state that represents the
      // criteria's results
      $scope.$on('criteriaChange', $scope.onCriteriaChange);

      // will be broadcast by mlAuth on a change to the session state
      // do a search b/c permissions are impacted
      $scope.$on('sessionChange', function () {
        $scope.runSearch();
      });

      $scope.clearTagsConstraint = function () {
        var tags = $scope.search.criteria.constraints.tags;
        if (tags.values && tags.values.length) {
          tags.values = [];
          $scope.$emit('criteriaChange');
        }
      };

      $scope.clearDatesConstraints = function () {
        $scope.search.criteria.constraints.dateStart.value = null;
        $scope.search.criteria.constraints.dateEnd.value = null;
        $scope.$emit('criteriaChange');
      };

      $scope.runSearch = function () {
        $scope.searching = true;
        if ($scope.search.results) {
          $scope.search.results.total = null;
        }

        $scope.applyScopeToSearch();

        $scope.search.shadowSearch().then(
          function () {

            // if the search params specify an out-of-bounds page,
            // change the page spec
            if ($scope.search.pageOutOfBounds()) {
              $scope.search.setPageInBounds();
              $scope.$emit('criteriaChange');
              return;
            }

            // until there is snippeting, abbreviate the body
            $scope.search.results.items.forEach(function (item) {
              if (item.content.text && item.content.text.length > 400) {
                item.content.text = item.content.text.substring(0,400) +
                    '...';
              }
            });

            // notify directives so they don't have to watch
            // wait for a digestcycle so that we don't show repeaters
            // while they're repeating
            $timeout(function () {
              $scope.$broadcast('newResults');
              // so templates can stop showing spinners
              $scope.searching = false;
              // so the layout can stop showing its spinner
              $scope.setLoading(false);
            });
          },
          function (reason) {
            // so templates can stop showing spinners
            $scope.searching = false;
            // so the layout can stop showing its spinner
            $scope.setLoading(false);
            throw new Error(
              JSON.stringify(reason),
              'ssSearch:post'
            );
          }
        );

      };

      init();

    }

  ]);

});
