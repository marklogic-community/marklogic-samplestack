/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

/*
app/deps.js

Load all dependency modules files  and return an array of their angular module
names.
 */

require.config({
  paths: {
    /* jshint ignore: start */
    'lodash': 'deps/lodash/dist/lodash.compat',
    'angular': 'deps/angular/angular',
    'ui-router': 'deps/angular-ui-router/release/angular-ui-router',
    'state-helper': 'deps/angular-ui-router.stateHelper/statehelper',
    'ui-bootstrap': 'deps/angular-bootstrap/ui-bootstrap-tpls',
    'angular-sanitize': 'deps/angular-sanitize/angular-sanitize',
    'ng-markdown': 'deps/ngMarkdown/wizMarkdown/wizMarkdown',
    'marked': 'deps/marked/lib/marked',
    'angular-marked': 'deps/angular-marked/angular-marked',
    'jquery': 'deps/jquery/dist/jquery',
    'highcharts': 'deps/highcharts/highcharts',
    'highcharts-ng': 'deps/highcharts-ng/dist/highcharts-ng',
    'highlightjs': 'deps/highlightjs/highlight.pack',
    'json': 'deps/requirejs-plugins/src/json',
    'text': 'deps/requirejs-plugins/lib/text',
    'ng-tags-input': 'deps/ng-tags-input/ng-tags-input',
    'stacktrace-js':'deps/stacktrace-js/dist/stacktrace',
    'jstzdetect': 'deps/jstzdetect/jstz'
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
    'highlightjs': { exports: 'hljs' },
    'ng-tags-input': { deps: ['angular'] },
    'jstzdetect': { exports: 'jstz' }
  }
});

define(
  [
    // first include those that we actually need to "handle" while we load
    // them here.  List them first so that only those that need special
    // handling need to be referenced in the callback function.
    'lodash',
    'angular',

    'stacktrace-js',
    'marked',
    'highlightjs',
    'jstzdetect',
    'stacktrace-js',
    'ui-router',
    'state-helper',
    'ui-bootstrap',
    'highcharts',
    'highcharts-ng',
    'angular-marked',
    'angular-sanitize',
    'ng-markdown',
    'ng-tags-input',

    '_marklogic/marklogic'
  ],
  function (lodash, angular, stacktrace, marked, hljs, jstz) {

    // lodash and angular are made global as a convenience.
    window._ = lodash;
    window.angular = angular;
    window.marked = marked;
    window.jstz = jstz;
    window.stacktrace = stacktrace;
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
      'ngTagsInput',

      '_marklogic'
    ];
  }
);
