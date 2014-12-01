module.exports = function () {
  this.World = World;

  this.Then(
    /title input is "(.*)"/,
    function (title, next) {
      expect(this.currentPage.titleText)
          .to.eventually.equal(title).and.notify(next);
    }
  );

};
