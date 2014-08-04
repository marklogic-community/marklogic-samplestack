/*
app/module.js

Declare app module as having dependencies on other modules specified by
app/deps.

This module will subsequently be required by each component so that the
components can register themselves int he module.
 */
define(

  ['./deps'],
  function (deps) {

    // rely on deps module to load all dependencies and to expose an array of
    // names, which we assign as dependencies of the module named by the appName
    // build parametwer (see /buildParams.json).
    //
    // TODO: deal with buildParams.json (use such a thing?).
    //

    /**
     * @ngdoc module
     * @name app
     *
     * @description
     * The `app` module is the Samplestack application module. It is an
     an implementation of a MarkLogic-based
     * AngularJS application. It depends on and uses the components of the
     _marklogic module.
     */
    return angular.module('app', deps);
  }

);
