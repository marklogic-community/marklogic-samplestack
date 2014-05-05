// this will set up chai and globally register the expect function
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
global.expect = chai.expect;
// webdriver promises do not derive from Object.prototype, thus should
// cannot influence them
// chai.should();


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

function addPage (name, Page) {
  util.inherits(Page, PageBase);
  pages[name] = new Page();
}
World.addPage = addPage;

Object.defineProperty(World.prototype, 'pageTitle', {
  get: function () { return ptor.getTitle(); }
});


// one usually doesn't do this, but within the cucumber tests, we're
// putting world on the global scope to reduce test code noise
//
global.World = World;
