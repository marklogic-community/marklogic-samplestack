module.exports = function () {
  this.World = World;
  this.When(/^I lookup tags that match "([^"]*)"$/, function (arg1, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^the tags lookup list should display$/, function (table, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.When(/^I select "([^"]*)"$/, function (arg1, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^the results count should equal "([^"]*)"$/, function (arg1, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^the selected tags should display$/, function (table, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });
};
