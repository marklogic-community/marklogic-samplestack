/*
app/deps.js

Load all dependency modules files  and return an array of their angular module
names.
 */

require.config({
  paths: {
    /* jshint ignore: start */
    'lodash': 'deps/lodash/dist/lodash.compat<%=options.min%>',
    'angular': 'deps/angular/angular<%=options.min%>',
    'ui-router': 'deps/angular-ui-router/release/angular-ui-router<%=options.min%>',
    'state-helper': 'deps/angular-ui-router.stateHelper/statehelper<%=options.min%>',
    'ui-bootstrap': 'deps/angular-bootstrap/ui-bootstrap-tpls<%=options.min%>',
    'angular-sanitize': 'deps/angular-sanitize/angular-sanitize<%=options.min%>',
    'ng-markdown': 'deps/ngMarkdown/wizMarkdown/wizMarkdown<%=options.min%>',
    'marked': 'deps/marked/lib/marked<%=options.min%>',
    'angular-marked': 'deps/angular-marked/angular-marked<%=options.min%>',
    'jquery': 'deps/jquery/dist/jquery<%=options.min%>',
    'highcharts': 'deps/highcharts/highcharts',
    'highcharts-ng': 'deps/highcharts-ng/dist/highcharts-ng<%=options.min%>',
    'highlightjs': 'deps/highlightjs/highlight.pack<%=options.min%>',
    'json': 'deps/requirejs-plugins/src/json',
    'text': 'deps/requirejs-plugins/lib/text'
    /* jshint ignore: end */
  },

  shim: {
    'angular': { exports: 'angular', deps: ['jquery'] },
    'angular-mocks': { deps: ['angular'] },
    'ui-router': { deps: ['angular'] },
    'state-helper': { deps: ['angular', 'ui-router'] },
    'ui-bootstrap': { deps: ['angular'] },
    'highcharts-ng': { deps: ['angular', 'highcharts'] },
    'highcharts': { deps: ['jquery'], exports: 'Highcharts' },
    'angular-sanitize': { deps: ['angular'] },
    'ng-markdown': { deps: ['angular', 'angular-sanitize'] },
    'angular-marked': { deps: ['angular'] },
    'highlightjs': { exports: 'hljs' }
  }
});

define(
  [
    // first include those that we actually need to "handle" while we load
    // them here.  List them first so that only those that need special
    // handling need to be referenced in the callback function.
    'lodash',
    'angular',

    'marked',
    'highlightjs',
    'ui-router',
    'state-helper',
    'ui-bootstrap',
    'highcharts-ng',
    'angular-marked',
    'angular-sanitize',
    'ng-markdown',

    '_marklogic/marklogic'
  ],
  function (lodash, angular, marked, hljs) {

    // lodash and angular are made global as a convenience.
    window._ = lodash;
    window.angular = angular;
    window.marked = marked;
    marked.setOptions({
      gfm: true,
      highlight: function (code) {
        return hljs.highlightAuto(code).value;
      }
    });


    return [
      'ui.router',
      'ui.router.stateHelper',
      'ui.bootstrap',
      'highcharts-ng',
      'hc.marked',
      'ngSanitize',
      'wiz.markdown',

      '_marklogic'
    ];
  }
);
