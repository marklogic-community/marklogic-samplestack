module.exports = function () {
  this.World = World;

  this.When(
    /visit the "qnadoc" page with id "(.*)"/,
    function (qid, next) {
      this.go(this.pages['qnadoc'], '/' + qid)
        .then(this.notifyOk(next), next);
    }
  );

  this.When(
    /focus on the question/,
    function (next) {
      this.currentPage.focusQuestion()
        .then(this.notifyOk(next), next);
    }
  );

};
