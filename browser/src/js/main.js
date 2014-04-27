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
      'ui-bootstrap': 'bower_components/angular-bootstrap/ui-bootstrap',
      'spinner': 'bower_components/angular-spinner/angular-spinner',
      'spinjs': 'bower_components/spin.js/spin',
      'dialogs': 'bower_components/angular-dialog-service/dialogs',
      'angular-sanitize': 'bower_components/angular-sanitize/angular-sanitize',
      'moment': 'bower_components/momentjs/moment',
      'ng-table': 'bower_components/ng-table/ng-table'
      /* jshint +W101 */
    },

    shim: {
      'angular': {
        exports: 'angular'
      },
      'angular-mocks': {
        deps: ['angular']
      },
      'ui-bootstrap': {
        deps: ['angular']
      },
      'ui-router': {
        deps: ['angular']
      },
      'ng-table': {
        deps: ['angular']
      },
      'angular-sanitize': {
        deps: ['angular']
      },
      'state-helper': {
        deps: ['angular', 'ui-router']
      },
      'spinner': {
        deps: ['spinjs']
      },
      'dialogs': {
        deps: ['ui-bootstrap', 'angular-sanitize']
      },
      'mocha': {
        exports: 'mocha'

      },
      'sinon-chai': {
        deps: ['sinon']
      }
    }

  });

  require(['lodash', 'moment'], function(_, moment) {
    // lodash is used so frequently that it's better to make it global.
    // a rare exception to the intent of not using globals
    window._ = _;

    var newFromJson = function(json) {
      if (!_.isString(json)) {
        return json;
      }
      else {
        return JSON.parse(json, function(key, val) {
          var momentized = moment(val);
          if (momentized.isValid()) {
            return momentized.toDate();
          }
          else {
            return val;
          }
        });
      }
    };

/* jshint ignore:start */
<% if (unit) { %>
/* jshint ignore:end */
/******************************************
unit test config
******************************************/
    // do not include the run module, instead config
    require(['angular', 'app', 'config'], function(ng, app) {

      angular.fromJSON = newFromJson;

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

      angular.fromJSON = newFromJson;

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

/* jshint ignore:start */
<% } %>
/* jshint ignore:end */


  });
}());
