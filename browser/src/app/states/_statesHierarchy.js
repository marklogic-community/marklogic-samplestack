define(
  [
    'app/module',
  ],
  function (module) {
    var root = {
      name: 'root',
      abstract: true,
      url: '',
      children: [],
      templateUrl: '/app/states/_root.html'
    };

    var layout = {
      name: 'layout',
      abstract: true,
      templateUrl: '/app/states/_layout.html'
    };
    root.children.push(layout);

    layout.children = [
      // {
      //   name: 'documents',
      //   url: '/' // there will be a bunch of URL parameters possible
      // },
      {
        name: 'fourOhFour',
        url: '/404',
      },
      {
        name: 'explore',
        // will deal with all sorts of parameters here, potentially
        // as sub-states
        url: '/'
      },
      {
        name: 'qnaDoc',
        url: '/doc/:id'
      },
      {
        name: 'ask',
        url: '/ask'
      }
    ];

    module.constant('statesHierarchy', root);

  }
);
