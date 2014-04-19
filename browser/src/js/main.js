(function() {

  'use strict';

  require.config({

    paths: {
      /* jshint -W101 */ // disable line length rule
      'lodash': 'bower_components/lodash/dist/lodash.compat',
      'angular': 'bower_components/angular/angular',
      'ui-router': 'bower_components/angular-ui-router/release/angular-ui-router',
      'state-helper': 'bower_components/angular-ui-router.stateHelper/statehelper'
      /* jshint +W101 */
    },

    shim: {
      'angular': {
        exports: 'angular'
      },
      'ui-router': {
        deps: ['angular']
      },
      'state-helper': {
        deps: ['angular', 'ui-router']
      }
    }

  });

  require(['lodash'], function(_) {
    // lodash is used so frequently that it's better to make it global.
    // this is a rare exception to the rule
    window._ = _;

    require(['angular', 'app', 'run'], function(ng, app) {


      /**
       * attach the app to the DOM -- test tools like this to be present
       * @return {undefined}
       */
      var bootstrap = function() {
        var htmlElement = ng.element(document.children[0]);
        /**
         * attach the app to the DOM -- test tools like this to be present
         * @return {undefined}
         */
        var doBoostrap = function() {
          htmlElement.addClass('ng-app');
          htmlElement.addClass('spun');
          // setTimeout(function() {


          // }, 1000)
        };

        ng.bootstrap(htmlElement, [app['name'], doBoostrap]);
      };

      // when the document is ready, bootstrap the app
      ng.element(document).ready(bootstrap);
    });

  });
}());
