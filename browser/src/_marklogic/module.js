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
     * The `marklogic` module provides Angular components that perform
     * functions that are related to accessing a MarkLogic-based application,
     * along with other functions that form a foundation for building an
     * application like Samplestack.  There are no specific Samplestack
     * features implemented in this module.
     *
     * We have separated the functionality in this module in the hopes that it
     * may help developers to find software code within this app that can serve
     * as examples of how one might implement their own application.
     *
     * This module is referenced as a dependency by the main
     * {@link app app module}.
     *
     *  **Please note:** While the functionality in this module is relatively
     * generic in nature (i.e. it doesn't directly implement Samplestack
     * application features), it is not meant to be considered as a supported
     * MarkLogic library on its own.
     *
     * Developers may use this code in their applications (subject to the
     * licensing terms), but such use outside of
     * Samplestack is not directly supported by MarkLogic
     * Corporation.
     */
    return angular.module('_marklogic', deps);
  }

);
