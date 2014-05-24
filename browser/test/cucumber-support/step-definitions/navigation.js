module.exports = function () {
  this.World = World;

  this.Given(
    /"(.*)" is on the "(.*)" page/,
    function (role, pageName, next) {
      this.go(this.pages[pageName]).then(next);
    }
  );

  this.When(
    /visit the landing page/,
    function (next) {
      this.go(this.pages.documents).then(next);
    }
  );

  this.Then(
    /the page title is "(.*)"/,
    function (title, next) {
      expect(this.pageTitle)
        .to.eventually.equal(title)
        .and.notify(next);
    }
  );

};
