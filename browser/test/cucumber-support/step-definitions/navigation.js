module.exports = function () {
  this.World = World;

  this.When(
    /visit the "(.*)" page/,
    function (name, next) {
      this.go(this.pages[name]).then(next);
    }
  );

  this.Then(
    /the page title is "(.*)"/,
    function (title, next) {
      expect(this.currentPage.pageTitle)
        .to.eventually.equal(title)
        .and.notify(next);
    }
  );

};
