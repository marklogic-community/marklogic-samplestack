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

// this file adds global variables -- not generally a good idea but for
// cucumber tests it's handy
var path = require('path');
global._ = require('lodash');
global.q = require('q');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
global.expect = chai.expect;

var util = require('util');

var users = require('./configuration/users');

var pages = {};

var self;

var currentPage;

browser.getCapabilities().then(function (cap) {
  browser.caps = cap.caps_;
});
browser.driver.manage().window().maximize();

function World (callback) {
  self = this;
  this.pages = pages;
  callback(this);
}

var PageBase = require('./page-objects/PageBase');

Object.defineProperty(World.prototype, 'currentPage', {
  get: function () {
    return currentPage;
  },
  set: function (page) {
    currentPage = page;
  }
});

World.addPage = function (Page) {
  var page = PageBase.instantiate(Page);
  pages[Page.pageName] = page;
  _.forEach(Page.aliases, function (alias) {
    pages[alias] = page;
  });
};

World.prototype.go = function (page, suffix) {
  var curPage = self.currentPage;
  var url = page.url + (suffix ? suffix : '');
  var promise = curPage ?
      browser.setLocation(url) :
      browser.get(url);
  return promise.then(
    function () {
      self.currentPage = page;
      return page;
    }
  );
};

var notifyOk = function (next) {
  return function () {
    next();
  };
};

World.prototype.notifyOk = notifyOk;

World.prototype.authenticate = function () {
  var goPage;
  if (!self.currentPage) {
    goPage = self.go(self.pages.default);
  }

  return q.when(goPage)
    .then(function () {
      return self.currentPage.isLoggedIn;
    })
    .then(function (isLoggedIn) {
      if (isLoggedIn) {
        return;
      }
      else {
        return self.currentPage.login(
          users.Joe.userName, users.Joe.password
        );
      }
    });
};

World.prototype.authenticateAs = function (userName, password) {
  var goPage;
  if (!self.currentPage) {
    goPage = self.go(self.pages.default);
  }

  return q.when(goPage).then(function () {
    if (userName) {
      return self.currentPage.loginIfNecessary(userName, password);
    }
    else {
      return self.currentPage.logoutIfNecessary();
    }
  });
};

var setPrepareStackTrace = function (isOn) {
  if (isOn) {

    // monkey-patch stack trace more-or-less compatible with webdriver
    var isMyCode = new RegExp(
      path.join(
        __dirname,
        '../..',
        '[^node_modules/]'
      )
          .replace(/\//g, '\\/')
    );


    Error.prepareStackTrace = function (err, stack) {
      var i;
      var frame;
      var results = [];
      for (i = 0; i < stack.length; i++) {
        frame = stack[i].toString();
        if (isMyCode.test(frame)) {
          results.push('    at ' + frame);
        }
      }
      return results.length ? '\n' + results.join('\n') : '';
    };

  }

  else {
    delete Error.prepareStackTrace;
  }

};

// TODO -- fix this so it doesn't lose the actual error message :)
// setPrepareStackTrace(true);

global.World = World;
