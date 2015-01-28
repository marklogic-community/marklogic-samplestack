define(
  [
    'app/module',
  ],
  function (module) {

    /**
     * @ngdoc constant
     * @name statesHierarchy
     * @description
     * Used by the {@link appRouting} service to define the hierarchy of
     * <a href="https://github.com/angular-ui/ui-router"
     * target="_blank">ui-router</a> states.
     */
    var root = {
      name: 'root',
      abstract: true,
      views: {
        '': {
          controller: 'rootCtlr',
          templateUrl: '/app/states/_root.html'
        }
      },
      children: [
        {
          name: 'root.layout',
          abstract: true,
          controller: 'layoutCtlr',
          templateUrl: '/app/states/_layout.html',
          resolve: {
            appInitialized: [
              'mlAuth', function (mlAuth) { return mlAuth.restoreSession(); }
            ]
          }
        }
      ]
    };

    root.children[0].children = [
      {
        name: 'root.layout.fourOhFour',
        url: '/404',
        controller: 'fourOhFourCtlr',
        templateUrl: '/app/states/fourOhFour.html'
      },
      {
        name: 'root.layout.explore',
        abstract: true,
        templateUrl: '/app/states/explore.html',
        controller: 'exploreCtlr',
        children: [
          {
            name: 'root.layout.explore.results',
            url: '/?q&tags&date-ge&date-lt&resolved&contributor&page&sort',
            controller: 'exploreResultsCtlr',
            templateUrl: '/app/states/exploreResults.html'
          }
        ]
      },
      {
        name: 'root.layout.qnaDoc',
        url: '/doc/:id?q&content-id',
        controller: 'qnaDocCtlr',
        templateUrl: '/app/states/qnaDoc.html'
      },
      {
        name: 'root.layout.ask',
        authRequired: true,
        url: '/ask',
        controller: 'askCtlr',
        templateUrl: '/app/states/ask.html'
      }

    ];


    root.find = function (stateName) {
      var myObj = root;
      var children = [root];
      var names = stateName.split('.');
      var nameToFind = names[0];

      var processChild = function (child) {
        if (child.name === nameToFind) {
          myObj = child;
          children = child.children;
          names.shift();
          return false;
        }

      };

      while (names.length) {
        _.forEach(children, processChild);
        nameToFind += ('.' + names[0]);
      }
      return myObj;
    };

    module.constant('statesHierarchy', root);

  }
);
