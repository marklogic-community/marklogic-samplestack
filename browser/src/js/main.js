(function() {

  'use strict';

  require.config({

    packages: {

    },

    paths: {
      /* jshint -W101 */ // disable line length rule
      'lodash': 'bower_components/lodash/dist/lodash.compat',
      'angular': 'bower_components/angular/angular',
      'angular-mocks': 'bower_components/angular-mocks/angular-mocks',
      'ui-router': 'bower_components/angular-ui-router/release/angular-ui-router',
      'state-helper': 'bower_components/angular-ui-router.stateHelper/statehelper',
      'mocha': 'bower_components/mocha/mocha',
      'chai': 'bower_components/chai/chai'
      // 'sinon': 'bower_components/sinon/lib/sinon',
      // 'sinon-lib': 'bower_components/sinon/lib/sinon/.',
      /* jshint +W101 */
    },

    shim: {
      'angular': {
        exports: 'angular'
      },
      'angular-mocks': {
        deps: ['angular']
      },
      'ui-router': {
        deps: ['angular']
      },
      'state-helper': {
        deps: ['angular', 'ui-router']
      },
      'mocha': {
        exports: 'mocha'

      },
      'sinon-chai': {
        deps: ['sinon']
      }
    }

  });

  require(['lodash'], function(_) {
    // lodash is used so frequently that it's better to make it global.
    // this is a rare exception to the rule
    window._ = _;


/* jshint ignore:start */
<% if (unit) { %>
/* jshint ignore:end */
/******************************************
unit test config
******************************************/
    // do not include the run module, instead config
    require(['angular', 'app', 'config'], function(ng, app) {

      require(['all.unit'], function() {
        // window.sinon = sinon;
        var myMocha = window.mochaPhantomJS ? window.mochaPhantomJS : mocha;
        // mocha.setup('bdd');
        myMocha.run();
      });
    });

/* jshint ignore:start */
<% } else { %>
/* jshint ignore:end */
/******************************************
runtime config
******************************************/
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

/* jshint ignore:start */
<% } %>
/* jshint ignore:end */


  });
}());
