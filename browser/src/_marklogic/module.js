/*
_marklogic/module.js

Declare marklogic module as having dependencies on other modules specified by
marklogic/deps.

This module will subsequently be required by each component so that the
components can register themselves in the module.
 */

define(

  ['./deps'],
  function (deps) {

    // rely on deps module to load all dependencies and to expose an array of
    // names, which we assign as dependencies of the module named by the appName
    // build parametwer (see /buildParams.json).
    //
    // TODO: deal with buildParams.json (use such a thing?).

    /**
     * @ngdoc module
     * @name _marklogic
     * @description
     * The `marklogic` module contains sample code that you might want
     * to use in your own Marklogic-based application development projects.
     */
    return angular.module('_marklogic', deps);
  }

);
