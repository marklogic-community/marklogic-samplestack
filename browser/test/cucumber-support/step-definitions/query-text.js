module.exports = function () {
  this.World = World;

  this.Then(
    /^the text search criteria are empty$/,
    function (next) {
      this.currentPage.queryText
        .should.eventually.equal('')
        .and.notify(next);
    }
  );
};
