// this file adds global variables -- not generally a good idea but for
// cucumber tests it's handy
var path = require('path');
var _ = require('lodash');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
// webdriver promises do not derive from Object.prototype, thus `should`
// cannot influence them
// chai.should();
global.expect = chai.expect;

global.ptor = require('protractor').getInstance();

var util = require('util');

function PageBase () {}

PageBase.prototype.go = function () {
  return ptor.get(this.url);
};

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
  _.forEach(spec.aliases, function(alias) {
    pages[alias] = pages[spec.name];
  })
}

World.addPage = addPage;

Object.defineProperty(World.prototype, 'pageTitle', {
  get: function () {
    var title = ptor.getTitle();
    return title;
  }
});

var setPrepareStackTrace = function(isOn) {
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

setPrepareStackTrace(true);

global.World = World;
