// this file adds global variables -- not generally a good idea but for
// cucumber tests it's handy
var path = require('path');
global._ = require('lodash');
global.q = require('q');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
global.expect = chai.expect;

var ptor = require('protractor').getInstance();

var util = require('util');

var pages = {};

var self;
function World (callback) {
  self = this;
  this.pages = pages;
  this.currentPage = null;
  callback(this);
}

var PageBase = require('./page-objects/PageBase');

World.addPage = function (Page) {
  var page = PageBase.instantiate(Page);
  pages[Page.name] = page;
  _.forEach(Page.aliases, function (alias) {
    pages[alias] = page;
  });
};

World.prototype.go = function (page) {
  return ptor.get(page.url).then(
    function () {
      self.currentPage = page;
    }
  );
  //   var setAndReturn = function () {
  //   this.currentPage = page;
  // };
  //
  // var doGo = function () {
  //   console.log('gonna doGo');
  //   return browser.driver.get(page.url).then(function () {
  //     console.log('did go');
  //     this.currentPage = page;
  //   });
  //
  // };
  //
  // console.log('getCurrentUrl');
  // try {
  //   return browser.driver.getCurrentUrl().then(
  //     function (currentUrl) {
  //       if (currentUrl === page.url) {
  //         console.log('current url!!!');
  //         return setAndReturn();
  //       }
  //       else {
  //         console.log('no current url');
  //         return browser.wait().then(doGo);
  //       }
  //     },
  //     function () {
  //       console.log('gonna wait');
  //       return browser.wait().then(doGo);
  //     }
  //   );
  // }
  // catch (err) {
  //   console.log('it has to be one or the other');
  //   console.log(err);
  // }
};

World.prototype.authenticateAs = function (userName, password) {
  var goPage;
  if (!self.currentPage) {
    goPage = self.go(self.pages.default);
  }
  return q.when(goPage, function () {
    if (userName) {
      return self.currentPage.loginIfNececessary(userName, password);
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
