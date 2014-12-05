module.exports = function () {
  this.World = World;

  this.When(
    /perform a search for "(.*)"/,
    function (searchText, next) {
      this.currentPage.search(searchText).then(this.notifyOk(next), next);
    }
  );

  this.Then(
    /docs count is "(.*)"/,
    function (count, next) {
      expect(this.currentPage.docsCount)
          .to.eventually.equal(parseInt(count)).and.notify(next);
    }
  );

  this.Then(
    /first result title is "(.*)"/,
    function (title, next) {
      expect(this.currentPage.firstResultTitle)
          .to.eventually.equal(title).and.notify(next);
    }
  );

  this.Then(
    /last result title is "(.*)"/,
    function (title, next) {
      expect(this.currentPage.lastResultTitle)
          .to.eventually.equal(title).and.notify(next);
    }
  );

};
