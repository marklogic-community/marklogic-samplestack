module.exports = function () {
  this.World = World;

  this.When(
    /view the content contributor/,
    function (next) {
      this.currentPage.focusedItem.metadata.openContributorDialog()
        .then(this.notifyOk(next), next);
    }
  );

  this.When(
    /content contributor reputation is known as "(.*)"/,
    function (repAlias, next) {
      var self = this;

      this.currentPage.focusedItem.metadata.reputation
        .then(function (rep) { self[repAlias] = rep; })
        .then(this.notifyOk(next), next);
    }
  );

  this.When(
    /I vote it up/,
    function (next) {
      this.currentPage.questionVoteUp().then(this.notifyOk(next), next);
    }
  );

  this.Then(
    /content contributor reputation is greater than "(.*)"/,
    function (repAlias, next) {
      expect(this.currentPage.focusedItem.metadata.reputation)
        .to.eventually.be.greaterThan(this[repAlias])
        .and.notify(next);
    }
  );

};
