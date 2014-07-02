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

/*
TODO: this should be auto-generated at build time based on a glob pattern that
finds all components.  This pattern enables us to add/remove components
from the component directories without requiring us to reference/de-reference
the files individually.
*/
  // './dialogs/speech',
  // './directives/mlssRating',
  // './directives/version',
  // './filters/moment',
  './filters/point',
  // './filters/restTranslate',
  './services/appRouting',
  './services/stubData',
  // './services/rest',
  './states/_layout',
  './states/_root',
  './states/_statesHierarchy',
  './states/ask',
  './states/explore',
  // './states/documents',
  './states/fourOhFour',
  './states/qnaDoc'
  // './states/speeches'

], function () {});
