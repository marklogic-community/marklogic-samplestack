/*
app/app.js

Define app module with all components loaded.
 */

define(['./module', './components'], function (module) {

  // Each referenced component is responsible for defining itself and adding
  // itself to the module.
  //
  // It is thus sufficient to return the module now -- we have forced
  // all components to be defined and included.

  // define settings constant from buildParams
  //
  module.constant(

    'appSettings',
    angular.fromJson(
      '<%= JSON.stringify(appSettings) %>'
    )

  );
  // });

  return module;

});
