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

var url = require('url');

// expose lodash globally for easy access
global._ = require('lodash');
_.mixin(require('lodash-deep'));

var credentials = require('../credentials');
var pkg = require('../../package.json');

var defaults = {

  addresses: {
    // the middle tier
    appServer: url.parse('http://localhost:3000'),
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
    e2eCoverage: url.parse('http://localhost:3004/coverage/')
  },

  middleTier: {
    // how many worker child processes to launch
    numWorkers: 1,
    // easy access to the contents of package.json file
    // pkg: require('./package.json'),
    // ip to which the server children bind
    address: '0.0.0.0',
    // port on which server children bind
    port: 3000,
    // whether to use https or not
    https: false,
    // https: {
    //   key: fs.readFileSync('sslcert/server.key', 'utf8'),
    //   cert: fs.readFileSync('sslcert/server.crt', 'utf8')
    // }
    // whether html5 pushstate mode should be enabled (if serving webapp)
    html5Mode: true,
    // whether to run/enforce CSRF protection
    enableCsrf: false,
    // properties for database tier connections
    db: {
      clientConnection: {
        host:     'localhost',
        port:     '8006',
        authType: 'DIGEST'
      }
    },
    // properties of LDAP authentication
    //
    // //better docs please
    ldap: {
      hostname: 'localhost',
      port: 33388, // was 33389
      adminDn: 'cn=root',
      adminPassword: 'admin',
      searchBase: 'ou=people,dc=samplestack,dc=org',
      searchFilter: '(uid={{username}})',
      useBuiltInServer: true,
      // true for ldap over ssl (built-in server support not implemented)
      protocol: 'ldap' // or 'ldaps' for secure
    },
    // mapping of LDAP roles to database credentials
    // TODO store/manage passwords more securely
    rolesMap: {
      admins: {
        name: 'admins',
        ldap: 'cn=admins,ou=groups,dc=samplestack,dc=org',
        dbUser: 'samplestack-admin',
        dbPassword: 'samplestack-admin-password'
      },
      contributors: {
        name: 'contributors',
        ldap: 'cn=contributors,ou=groups,dc=samplestack,dc=org',
        dbUser: 'samplestack-contributor',
        dbPassword: 'sc-pass'
      },
      default: {
        name: 'default',
        dbUser: 'samplestack-guest',
        dbPassword: 'sa-pass'
      }
    }

  },

  // for different cases where livereload in browser is supported, specifies the
  // port on which to listen for/serve the messages
  liveReloadPorts: {
    webApp: 35730,
    unitCoverage: 35731
  },

  // not yet usec
  reportsDirs: {
    unit: 'browser/reports/unit',
    unitLcov: 'browser/reports/unit',
    e2eLcov: 'browser/reports/e2e'
  },

  // TODO: set ML account and read credentials from secure env vars
  sauceCredentials: {
    user: credentials.sauce.user ||
                process.env['SAUCE_USERNAME'],
    accessKey: credentials.sauce.accessToken ||
                process.env['SAUCE_ACCESS_KEY'],
  },

  /* jshint ignore:start */
  sauceBrowsers: {
    'win7-chrome-37': { platform: 'Windows 7', browserName: 'chrome', version: '37', deviceName: '' },
    'win7-firefox-32': { platform: 'Windows 7', browserName: 'firefox', version: '32', deviceName: '' },
    'win7-firefox-34': { platform: 'Windows 7', browserName: 'firefox', version: '34', deviceName: '' },
    'win7-ie-10': { platform: 'Windows 7', browserName: 'internet explorer', version: '10', deviceName: '' },
    'linux-chrome-37': { platform: 'Linux', browserName: 'chrome', version: '37', deviceName: '' },
    'linux-firefox-32': { platform: 'Linux', browserName: 'firefox', version: '32', deviceName: '' },
    'linux-firefox-34': { platform: 'Linux', browserName: 'firefox', version: '34', deviceName: '' },
    'osx10.10-chrome-37': { platform: 'OS X 10.10', browserName: 'chrome', version: '37', deviceName: '' },
    'osx10.10-chrome-41': { platform: 'OS X 10.10', browserName: 'chrome', version: '41', deviceName: '' },
    'osx10.10-firefox-32': { platform: 'OS X 10.10', browserName: 'firefox', version: '32', deviceName: '' },
    'osx10.10-firefox-34': { platform: 'OS X 10.10', browserName: 'firefox', version: '34', deviceName: '' },

    'win7-chrome-33': { platform: 'Windows 7', browserName: 'chrome', version: '33', deviceName: '' },
    'win7-chrome-38': { platform: 'Windows 7', browserName: 'chrome', version: '38', deviceName: '' },
    'win7-chrome-40': { platform: 'Windows 7', browserName: 'chrome', version: '40', deviceName: '' },
    'win7-chrome-41': { platform: 'Windows 7', browserName: 'chrome', version: '41', deviceName: '' },
    'win7-firefox-22': { platform: 'Windows 7', browserName: 'firefox', version: '22', deviceName: '' },
    'win7-firefox-32': { platform: 'Windows 7', browserName: 'firefox', version: '32', deviceName: '' },
    'win7-ie-10': { platform: 'Windows 7', browserName: 'internet explorer', version: '10', deviceName: '' },
    'win7-ie-11': { platform: 'Windows 7', browserName: 'internet explorer', version: '11', deviceName: '' },
    'win7-opera-11': { platform: 'Windows 7', browserName: 'opera', version: '11', deviceName: '' },
    'win7-opera-12': { platform: 'Windows 7', browserName: 'opera', version: '12', deviceName: '' },
    'win8-ie-10': { platform: 'Windows 8', browserName: 'internet explorer', version: '10', deviceName: '' },
    'win8.1-ie-11': { platform: 'Windows 8.1', browserName: 'internet explorer', version: '11', deviceName: '' },
    'linux-chrome-33': { platform: 'Linux', browserName: 'chrome', version: '33', deviceName: '' },
    'linux-chrome-38': { platform: 'Linux', browserName: 'chrome', version: '38', deviceName: '' },
    'linux-chrome-40': { platform: 'Linux', browserName: 'chrome', version: '40', deviceName: '' },
    'linux-chrome-41': { platform: 'Linux', browserName: 'chrome', version: '41', deviceName: '' },
    'linux-firefox-22': { platform: 'Linux', browserName: 'firefox', version: '22', deviceName: '' },
    'linux-firefox-32': { platform: 'Linux', browserName: 'firefox', version: '32', deviceName: '' },
    'linux-opera-12': { platform: 'Linux', browserName: 'opera', version: '12', deviceName: '' },
    'osx10.6-chrome-33': { platform: 'OS X 10.6', browserName: 'chrome', version: '33', deviceName: '' },
    'osx10.6-chrome-37': { platform: 'OS X 10.6', browserName: 'chrome', version: '37', deviceName: '' },
    'osx10.6-firefox-22': { platform: 'OS X 10.6', browserName: 'firefox', version: '22', deviceName: '' },
    'osx10.6-firefox-32': { platform: 'OS X 10.6', browserName: 'firefox', version: '32', deviceName: '' },
    'osx10.8-chrome-37': { platform: 'OS X 10.8', browserName: 'chrome', version: '37', deviceName: '' },
    'osx10.10-chrome-33': { platform: 'OS X 10.10', browserName: 'chrome', version: '33', deviceName: '' },
    'osx10.10-chrome-37': { platform: 'OS X 10.10', browserName: 'chrome', version: '37', deviceName: '' },
    'osx10.10-firefox-22': { platform: 'OS X 10.10', browserName: 'firefox', version: '22', deviceName: '' },
    'osx10.10-firefox-32': { platform: 'OS X 10.10', browserName: 'firefox', version: '32', deviceName: '' },
    'osx10.10-safari-7': { platform: 'OS X 10.10', browserName: 'safari', version: '7', deviceName: '' },
  },
  supportedBrowsers: [
    'linux-chrome-41',
    'linux-firefox-34',
    'osx10.10-chrome-41',
    'osx10.10-firefox-34', // Sauce doesn't have 10.8/ff-32
    'win7-firefox-34',
    'win7-chrome-41',
    'win7-ie-10'
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
  pkg: pkg,

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

  //
);
