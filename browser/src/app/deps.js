/*
app/deps.js

Load all dependency modules files  and return an array of their angular module
names.
 */

require.config({
  paths: {
    'lodash': 'deps/lodash/dist/lodash.compat<%=min%>',
    'angular': 'deps/angular/angular<%=min%>',
    'ui-router': 'deps/angular-ui-router/release/angular-ui-router<%=min%>',
    'state-helper': 'deps/angular-ui-router.stateHelper/statehelper<%=min%>',
    'ui-bootstrap': 'deps/angular-bootstrap/ui-bootstrap-tpls<%=min%>',
    'angular-sanitize': 'deps/angular-sanitize/angular-sanitize<%=min%>',
    'ng-markdown': 'deps/ngMarkdown/wizMarkdown/wizMarkdown<%=min%>',
    'marked': 'deps/marked/lib/marked<%=min%>',
    'angular-marked': 'deps/angular-marked/angular-marked<%=min%>',
    'jquery': 'deps/jquery/dist/jquery<%=min%>',
    'highcharts': 'deps/highcharts/highcharts',
    'highcharts-ng': 'deps/highcharts-ng/dist/highcharts-ng<%=min%>',
    'highlightjs': 'deps/highlightjs/highlight.pack<%=min%>',
    'json': 'deps/requirejs-plugins/src/json',
    'text': 'deps/requirejs-plugins/lib/text'
  },

  shim: {
    'angular': { exports: 'angular', deps: ['jquery'] },
    'angular-mocks': { deps: ['angular'] },
    'ui-router': { deps: ['angular'] },
    'state-helper': { deps: ['angular', 'ui-router'] },
    'ui-bootstrap': { deps: ['angular'] },
    'highcharts-ng': { deps: ['angular', 'highcharts'] },
    'highcharts': { deps: ['jquery'] },
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
