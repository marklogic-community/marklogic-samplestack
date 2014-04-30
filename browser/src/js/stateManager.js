define([
  'app', 'states/_root', 'state-helper', 'states/_allStates'
], function(app, root) {

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

    // define the state defs tree -- secon param
    // says that we've alrady prepared the names of
    // the states so don't use dot notation on them
    // to construct the names internally.
    // this is done to avoid having to refer to states
    // which are always abstract in state names
    stateHelperProvider.setNestedState(root, true);

    // $urlRouterProvider.otherwise('/404');

    this.$get = function() {
      return {};
    };

  });

});
