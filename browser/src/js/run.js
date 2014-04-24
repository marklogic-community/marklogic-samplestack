define(['app', 'config', 'stateManager'], function(app) {
  'use strict';

  app.run(function($rootScope, $state, stateManager) {

    // TODO: handle these more gracefully!
    // this should be the role of the stateManager
    $rootScope.$on('$stateNotFound',
        function(event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );
    $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );
    $rootScope.$on('$stateChangeError',
        function(event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );
    $rootScope.$on('$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );

    $state.go('root.docs');

  });
});

