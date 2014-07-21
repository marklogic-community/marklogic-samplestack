/*
app/appRouting.js
 */

define(['app/module'], function (module) {

  var setHtmlFiveOrHash = function ($provide, settings, $locationProvider) {
    $provide.decorator('$sniffer', function ($delegate) {
      // set history to false if you want to run hashode (perhaps your
      // webserver isn't configured for url rewriting in support of html5,
      // or you want hash signs in your urls for some other reason)
      // See buildParams to change this, see /gulp/tasks (search for
      // "modrewrite" to see an html5 push-mode
      // supporting configuration).

      if (settings.html5Mode === false) {
        // if we set history to falls, we're telling angular the browser
        // does not support html5 mode, which will cause it to adjust
        // (on the fly all of our URLs to use hash marks.  effectively
        // this disables html5 mode without invalidating all of the URLs
        // that are used throughout the application code (e.g for
        // state url assignments)
        $delegate.history = false;

      }

      return $delegate;
    });
    // don't be fooled -- html5 mode is controlled above based on settings
    // we do it this way so we can author all URLs in the app in a manner
    // that lets us choose at build time which mode to use, rather than
    // having to go back and change all of the URLs based on the decision
    // of html5mode or not.
    $locationProvider
      .html5Mode(true)
      .hashPrefix('');
  };

  var attachEvents = function ($rootScope) {
    // TODO: handle these more gracefully!
    // this should be the role of the stateManager
    $rootScope.$on('$stateNotFound',
        function (event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );
    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );
    $rootScope.$on('$stateChangeError',
        function (event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );
    $rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );

  };

  module.provider('appRouting', [

    'statesHierarchy',
    'stateHelperProvider',
    'appSettings',
    '$provide',
    '$locationProvider',
    '$urlRouterProvider',
    function (
      statesHierarchy,
      stateHelperProvider,
      appSettings,
      $provide,
      $locationProvider,
      $urlRouterProvider
    ) {

      // define the state defs tree -- secon param
      // says that we've alrady prepared the names of
      // the states so don't use dot notation on them
      // to construct the names internally.
      // this is done to avoid having to refer to states
      // which are always abstract in state names

      this.configure = function (hierarchy) {
        stateHelperProvider.setNestedState(hierarchy);
      };

      $urlRouterProvider.otherwise('/404');

      setHtmlFiveOrHash($provide, appSettings, $locationProvider);

      // TODO -- lots of stuff to be done here
      this.$get = [
        '$rootScope', '$state',
        function ($rootScope, $state) {
          attachEvents($rootScope);
          return {

            // easy way to get to navigable states without specifying
            // root.layout each time.
            go: function () {
              // first arg is statename without root.layout, so prepend it
              var args = Array.prototype.slice.call(arguments, 0);
              args[0] = 'root.layout.' + args[0];
              $state.go.apply(null, args);
            }

          };
        }
      ];

    }
  ]);
});
