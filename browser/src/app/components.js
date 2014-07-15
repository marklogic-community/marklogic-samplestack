/*
app/components.js

TODO: move and/or adapt this information into design doc.

Defines a module that consists of every component in the app.  This module
is a convenience and simplification.  Angular provides for dependency management
and thus we do not concern ourselves here with interdependencies among
components.  It is sufficient to ensure that they are all defined. Each
component injects the dependencies that it needs.

Require.js is used in this application as a stand-in for the more complete
dependency management that is coming in Angular 2.0 and ECMAScript 6.
 */

define([
  './services/index',
  './states/index'
], function () {});
