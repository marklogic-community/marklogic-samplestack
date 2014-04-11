(function() {

  'use strict';

  require.config({

    paths: {
      /* jshint -W101 */ // disable line length rule
      'angular': 'http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.10/angular',
      'ui-router': 'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.8/angular-ui-router'
      /* jshint +W101 */
    },

    shim: {
      'angular': {
        exports: 'angular'
      },
      'ui-router': {
        deps: ['angular']
      }
    }

  });

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
      };

      ng.bootstrap(htmlElement, [app['name'], doBoostrap]);
    };

    // when the document is ready, bootstrap the app
    ng.element(document).ready(bootstrap);
  });

}());
