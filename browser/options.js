var _ = require('lodash');

var url = require('url');

var defaults = {

  addresses: {
    // the middle tier
    appServer: url.parse('http://localhost:8090'),
    // for e2e testing
    seleniumServer: url.parse('http://localhost:4445'),
    // the marklogic application server
    marklogicServer: url.parse('http://localhost:8006'),
    // the web application
    webApp: url.parse('http://localhost:3000'),
    // test unit test runner for browser access to unit tests
    unitRunner: url.parse('http://localhost:3001/unit-runner.html'),
    // the unit test runner for executing covered tests (through phantomjs)
    unitRunnerCoverage: url.parse('http://localhost:3002/unit-runner.html'),
    // the reports for coverage from unit tests
    unitCoverage: url.parse('http://localhost:3002/coverage'),
    // the e2e coverage reports -- NOT YET USED
    e2eCoverage: url.parse('http://localhost:3004/coverage/'),
  },

  // for different cases where livereload in browser is supported, specifies the
  // port on which to listen for/serve the messages
  liveReloadPorts: {
    webApp: 35730,
    unitCoverage: 357301
  },

  // not yet usec
  reportsDirs: {
    unit: 'browser/reports/unit',
    unitLcov: 'browser/reports/unit',
    e2eLcov: 'browser/reports/e2e'
  },

/* jshint ignore:start */
  sauceBrowsers: {
    'win7-chrome-33': { platform: 'Windows 7', browserName: 'chrome', version: '33', deviceName: '' },
    'win7-chrome-38': { platform: 'Windows 7', browserName: 'chrome', version: '38', deviceName: '' },
    'win7-firefox-22': { platform: 'Windows 7', browserName: 'firefox', version: '22', deviceName: '' },
    'win7-firefox-32': { platform: 'Windows 7', browserName: 'firefox', version: '32', deviceName: '' },
    // 'win7-ie-9': { platform: 'Windows 7', browserName: 'internet explorer', version: '9', deviceName: '' },
    // 'win7-ie-10': { platform: 'Windows 7', browserName: 'internet explorer', version: '10', deviceName: '' },
    'win7-ie-11': { platform: 'Windows 7', browserName: 'internet explorer', version: '11', deviceName: '' },
    // 'win7-opera-11': { platform: 'Windows 7', browserName: 'opera', version: '11', deviceName: '' },
    // 'win7-opera-12': { platform: 'Windows 7', browserName: 'opera', version: '12', deviceName: '' },
    // 'win8-ie-10': { platform: 'Windows 8', browserName: 'internet explorer', version: '10', deviceName: '' },
    'win8.1-ie-11': { platform: 'Windows 8.1', browserName: 'internet explorer', version: '11', deviceName: '' },
    'linux-chrome-33': { platform: 'Linux', browserName: 'chrome', version: '33', deviceName: '' },
    'linux-chrome-38': { platform: 'Linux', browserName: 'chrome', version: '38', deviceName: '' },
    'linux-firefox-22': { platform: 'Linux', browserName: 'firefox', version: '22', deviceName: '' },
    'linux-firefox-32': { platform: 'Linux', browserName: 'firefox', version: '32', deviceName: '' },
    // 'linux-opera-12': { platform: 'Linux', browserName: 'opera', version: '12', deviceName: '' },
    'osx10.6-chrome-33': { platform: 'OS X 10.6', browserName: 'chrome', version: '33', deviceName: '' },
    'osx10.6-chrome-37': { platform: 'OS X 10.6', browserName: 'chrome', version: '37', deviceName: '' },
    'osx10.6-firefox-22': { platform: 'OS X 10.6', browserName: 'firefox', version: '22', deviceName: '' },
    'osx10.6-firefox-32': { platform: 'OS X 10.6', browserName: 'firefox', version: '32', deviceName: '' },
    'osx10.9-chrome-33': { platform: 'OS X 10.9', browserName: 'chrome', version: '33', deviceName: '' },
    'osx10.9-chrome-36': { platform: 'OS X 10.9', browserName: 'chrome', version: '36', deviceName: '' },
    'osx10.9-firefox-22': { platform: 'OS X 10.9', browserName: 'firefox', version: '22', deviceName: '' },
    'osx10.9-firefox-32': { platform: 'OS X 10.9', browserName: 'firefox', version: '32', deviceName: '' },
    // 'osx10.9-safari-7': { platform: 'OS X 10.9', browserName: 'safari', version: '7', deviceName: '' },
  },
  supportedBrowsers: [
    'linux-chrome-33',
    'linux-firefox-22',
    'osx10.9-chrome-33',
    'osx10.9-firefox-22',
    'win7-firefox-22',
    'win7-chrome-33',
    'win7-ie-9',
  ],
/* jshint ignore:end */

  // when not empty string, becomes a tweak to dependency paths so that
  // CDNs which present librarires with ".min.js" URLs can be referenced
  min: '',

  // in cases where there *IS* a defined mock for an appserver endpoing
  // (see src/modkedApp.js), use it rather than calling the actual middle tier.
  // This can
  // be helpful when middle-tier endpoint isn't ready. If there is no mock
  // for a given endpoint,the actual middle-tier endpoint would still be
  // called normally
  useE2eMocks: true,

  // exposes package.json in its entirety for easy access
  pkg: require('./package.json'),

  // browser app uses angular html5 push state routing
  html5Mode: true,

  // turn on/off CSRF handling in the browser
  // disable if the serer doesn't support CSRF acquisition, otherwise
  // TODO" new server-side CSRF implementation should be able to get rid
  // of this parameter as CSRF handling should kick in only when the server
  // supplies a CSRF header on login
  enableCsrf: false
};

// THESE OVERRIDES are mostly TODO
var envOverrides = {
  // at this time, doesn't have any overrides for unit testing
  unit: { },

  // NOT yet used
  e2e: {
    // because we want to run against instrumented app for e2e tests
    // webApp: url.parse('http://localhost:3003'),
    javaAppServer: url.parse('http://localhost:8090'),
    // TODO: run against **instrumented** app to determine coverage (on 8093)?
    nodeAppServer: url.parse('http://localhost:8090')
  },

  // not yet used
  prod: {
    // use minified version of lib files
    min: 'min',

    aopServer: url.parse('https://example.com')
  }
};

module.exports = _.transform(
  envOverrides,
  function (result, overrideSet, envName) {
    // merge the env-specific override into a copy of the base params
    // and added it to the result under the envname key
    result.envs[envName] = _.merge(_.clone(defaults), overrideSet);
  },
  // start with one set of params that is only the (base) set as "default"
  _.merge( { envs: {} }, _.clone(defaults))
);
