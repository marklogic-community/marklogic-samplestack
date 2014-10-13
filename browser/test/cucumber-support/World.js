// this file adds global variables -- not generally a good idea but for
// cucumber tests it's handy
var path = require('path');
var _ = require('lodash');
global.q = require('q');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();
// webdriver promises do not derive from Object.prototype, thus `should`
// cannot influence them
// chai.should();
global.expect = chai.expect;

global.ptor = require('protractor').getInstance();
ptor.ignoreSynchronization = false;

var util = require('util');

function PageBase () {}

var pages = {};

function World (callback) {
  this.pages = pages;
  this.currentPage = null;
  callback(this);
}

function addPage (spec) {
  var Page = spec.constructor;
  util.inherits(Page, PageBase);
  pages[spec.name] = new Page();
  _.forEach(spec.aliases, function (alias) {
    pages[alias] = pages[spec.name];
  });
}

World.addPage = addPage;

World.prototype.logout  = function () {
  return this.userName.then(function (name) {
    if (name) {
      element(by.className('ss-user-info-displayName')).click();
      return element(by.css('button')).click();
    }
  });
};


Object.defineProperty(World.prototype, 'pageTitle', {
  get: function () {
    var title = ptor.getTitle();
    return title;
  }
});

Object.defineProperty(World.prototype, 'userName', {
  get: function () {
    var el = element(by.className('ss-user-info-display-name'));
    return el.isElementPresent()
    .then(
      function (isPresent) {
        if (isPresent) {
          return el.getText().then(function (text) {
            return text.replace(/ \[$/, '');
          });
        }
        else {
          return null;
        }
      },
      function (err) {
        console.log('error!');
        console.log(err);
      }
    );
  }
});




World.prototype.go = function (page) {
  // console.log(ptor.waitForAngular.toString());
  // var deferred = q.defer();
  this.currentPage = page;
  return ptor.get(
    page.url
  );
  // .then(
  //   function () {
  //     console.log('gonna wait');
  //     return ptor.waitForAngular();
  //   }
  // );
  
  //   function () {
  //     (deferred.resolve);
  //     // )
  //     // setTimeout(function () { deferred.resolve(); }, 5000);
  //   }
  // );
  // return deferred.promise;
  // .then(function () {
  //   return ptor.getCurrentUrl();
  // });
  //   function () {
  //   console.log('gonna wait');
  //   var promise = ptor.waitForAngular();
  //   console.log('made promise');
  //   return promise;
  //   // return ptor.waitForAngular().then(
  //   //   function () {
  //   //     console.log('waited');
  //   //
  //   //   },
  //   //   function (err) {
  //   //     console.log('err: ' + err);
  //   //   }
  //   // );
  // });
  // return ptorPage;
  // ptor.waitForAngular();
  // return ptor.wait();
  //
  // var ptorPage = ptor.get(page.url);
  // var deferred = q.defer();
  // q.call(function () {
  //   ptor.waitForAngular(function () {
  // this.currentPage = page;
  //
  // return ptorPage;
    // deferred.resolve(ptorPage);
    // });
  // });
  //
  // return deferred.promise;
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
