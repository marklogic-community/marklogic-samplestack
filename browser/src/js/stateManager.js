define(['app', 'states/_root', 'state-helper'], function(app, root) {

  app.provider('stateManager', function(
    $provide, $locationProvider, stateHelperProvider, $urlRouterProvider) {

    $provide.decorator('$sniffer', function($delegate) {
      // Uncomment this line in order to use "hash" mode (for instance,
      // if your web server is not configured for html5 push mode).
      // See /gulp/tasks (search for "modrewrite" to see an html5 push-mode
      // supporting configuration).
      // $delegate.history = false;
      return $delegate;
    });
    $locationProvider
      .html5Mode(true)
      .hashPrefix('');


    stateHelperProvider.setNestedState(root);

    $urlRouterProvider.when('/', '/docs');
    $urlRouterProvider.otherwise('/404');

    this.$get = function() {
      return {};
    };

  });

});
