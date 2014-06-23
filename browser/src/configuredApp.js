/*
config.js

Configure the application module and expose it..
 */

define(['app/app'], function (appModule) {

  appModule.config([

    'appRoutingProvider', 'statesHierarchy', 'markedProvider',
    function (appRoutingProvider, statesHierarchy, markedProvider) {

      // Apply the statesHierarchy as configuration for the
      // appRoutingProvider/appRouting service.
      appRoutingProvider.configure(statesHierarchy);

      // render github-flavored markdown
      // TODO: set up highlight.js
      markedProvider.setOptions({gfm: true});

    }

  ]);

  return appModule;

});
