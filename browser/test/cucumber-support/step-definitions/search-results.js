module.exports = function () {
  this.World = World;

  this.Then(
    /docs count is "(.*)"/,
    function (count, next) {
      expect(this.currentPage.docsCount)
          .to.eventually.equal(count).and.notify(next);
    }
  );

  this.When(
    /visit the landing page/,
    function (next) {
      this.go(this.pages.explore).then(next);
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
