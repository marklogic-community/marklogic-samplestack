module.exports = function () {
  this.World = World;

  this.Then(/the contributor display name is "(.*)"/, function (name, next) {
    expect(this.currentPage.contributorDisplayName)
      .to.eventually.equal(name)
      .and.notify(next);
  });

  this.Then(/the contributor votes cast are greater than "(.*)"/, function (votes, next) {
    expect(this.currentPage.contributorVotesCast)
      .to.eventually.be.greaterThan(votes)
      .and.notify(next);
  });

  this.Then(
    /the contributor reputation is greater than "(.*)"/,
    function (reputation, next) {
      expect(this.currentPage.contributorReputation)
        .to.eventually.be.greaterThan(reputation)
        .and.notify(next);
    }
  );

  this.Then(/dismiss dialog/, function (next) {
    this.currentPage.dismiss().then(this.notifyOk(next), next);
  });

};
