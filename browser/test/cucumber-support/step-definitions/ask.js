module.exports = function () {
  this.World = World;

  this.Then(
    /question title is "(.*)"/,
    function (title, next) {
      expect(this.currentPage.qnaQuestionTitle)
          .to.eventually.equal(title).and.notify(next);
    }
  );

};
