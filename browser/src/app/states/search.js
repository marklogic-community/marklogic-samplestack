(function (undefined) {

  this.app.controller('searchCtlr', [

    '$scope',
    function ($scope) {

      $scope.setPageTitle('search');
      var facets = {
        'TWIST-ME': {
          'Twist the above': {},
          'to get rid of or': {},
          'restore a scroll': {},
          'bar.  This simulates': {},
          'having a very large': {},
          'set of active tags.': {},
          'Should be *safe*, *legal*': {},
          'and *rare*.': {},
          'e': {
            count: 45
          },
          'f': {
            count: 68
          },
          'g': {
            count: 45
          },
          'h': {
            count: 68
          },
          'i': {
            count: 45
          },
          'j': {
            count: 68
          },
          'k': {
            count: 45
          },
          'l': {
            count: 68
          },
          'm': {
            count: 45
          },
          'n': {
            count: 68
          },
          'o': {
            count: 45
          },
          'p': {
            count: 'ha! a string! gotcha'
          }
        },
        b: {
          'jquery': {
            count: 45
          },
          'angular': {
            count: 68
          },
          'a': {
            count: 45
          },
          'b': {
            count: 68
          },
          'c': {
            count: 45
          },
          'd': {
            count: 68
          },
          'e': {
            count: 45
          },
          'f': {
            count: 68
          },
          'g': {
            count: 45
          },
          'h': {
            count: 68
          },
          'i': {
            count: 45
          },
          'j': {
            count: 68
          },
          'k': {
            count: 45
          },
          'l': {
            count: 68
          },
          'm': {
            count: 45
          },
          'n': {
            count: 68
          },
          'o': {
            count: 45
          },
          'p': {
            count: 'ha! a string! gotcha'
          }
        },

      };
      $scope.model = {
        code: JSON.stringify(facets, null, ' ')
      };

    }
  ]);

}).call(global);
