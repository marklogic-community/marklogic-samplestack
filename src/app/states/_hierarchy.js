(function (undefined) {

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

    {
      name: 'home',
      url: '/'
    },
    {
      name: 'fourOhFour',
      url: '/404',
    }

  ];

  this.app.constant('statesHierarchy', root);

}).call(global);
