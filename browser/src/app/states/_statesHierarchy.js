define(
  [
    'app/module',
  ],
  function (module) {

    var root = {
      name: 'root',
      abstract: true,
      url: '',
      views: {
        '': {
          controller: 'rootCtlr',
          templateUrl: '/app/states/_root.html'
        }
      },
      children: [
        {
          name: 'layout',
          abstract: true,
          controller: 'layoutCtlr',
          templateUrl: '/app/states/_layout.html'
        }
      ]
    };

    root.children[0].children = [
      {
        name: 'fourOhFour',
        url: '/404',
        controller: 'fourOhFourCtlr',
        templateUrl: '/app/states/fourOhFour.html'
      },
      {
        name: 'explore',
        // will deal with all sorts of parameters here, potentially
        // as sub-states
        url: '/',
        controller: 'exploreCtlr',
        templateUrl: '/app/states/explore.html'
      },
      {
        name: 'qnaDoc',
        url: '/doc/:id',
        controller: 'qnaDocCtlr',
        templateUrl: '/app/states/qnaDoc.html'
      },
      {
        name: 'ask',
        url: '/ask',
        controller: 'askCtlr',
        templateUrl: '/app/states/ask.html'
      }

    ];

    module.constant('statesHierarchy', root);

  }
);
