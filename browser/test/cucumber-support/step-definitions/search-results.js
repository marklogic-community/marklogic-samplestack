module.exports = function () {
  this.World = World;

  this.Then(
    /docs count is "(.*)"/,
    function (count, next) {
      expect(this.currentPage.docsCount)
          .to.eventually.equal(parseInt(count)).and.notify(next);
    }
  );

};
