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
      name: 'search',
      url: '/' // there will be a bunch of URL parameters possible
    },
    {
      name: 'fourOhFour',
      url: '/404',
    },
    {
      name: 'speeches',
      url: '/speeches' // there will be a bunch of URL parameters possible
    },

  ];

  this.app.constant('statesHierarchy', root);

}).call(global);
