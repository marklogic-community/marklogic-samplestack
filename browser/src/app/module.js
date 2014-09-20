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
     * _marklogic module.
     *
     * At present, Angular.js does not provide strong support for documenting
     * *applications*, as opposed to libraries. As such, certain parts of the
     * documentation for the application may seem unwieldy. We have documented
     * controllers, dialogs and states using customized templates.
     *
     * The dev team has started conversations with the Angular devs on how to
     * go about documenting these types of objects and may have early access
     * to better methods for documentation. That said, the current
     * implementation of the docs is expected to be adequate.
     */
    return angular.module('app', deps);
  }

);
