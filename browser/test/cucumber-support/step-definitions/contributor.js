module.exports = function () {
  this.World = World;

  this.Then(/the contributor display name is "(.*)"/, function (name, next) {
    expect(this.currentPage.contributorDisplayName)
      .to.eventually.equal(name)
      .and.notify(next);
  });

  this.Then(/the contributor votes cast are "(.*)"/, function (votes, next) {
    expect(this.currentPage.contributorVotesCast)
      .to.eventually.equal(votes)
      .and.notify(next);
  });

  this.Then(
    /the contributor reputation is "(.*)"/,
    function (reputation, next) {
      expect(this.currentPage.contributorReputation)
        .to.eventually.equal(reputation)
        .and.notify(next);
    }
  );

  this.Then(/dismiss dialog/, function (next) {
    this.currentPage.dismiss().then(this.notifyOk(next), next);
  });

};
