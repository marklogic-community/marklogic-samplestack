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
        url: '/ask',
        controller: 'askCtlr',
        templateUrl: '/app/states/ask.html'
      }

    ];

    module.constant('statesHierarchy', root);

  }
);
