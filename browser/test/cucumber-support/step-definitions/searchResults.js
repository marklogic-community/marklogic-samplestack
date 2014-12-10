module.exports = function () {
  this.World = World;

  this.Then(
    /docs count is "(.*)"/,
    function (count, next) {
      expect(this.currentPage.resultsCount)
          .to.eventually.equal(parseInt(count)).and.notify(next);
    }
  );

  this.When(
    /focus on the "(.*)" search result/,
    function (positional, next) {
      switch (positional) {
        case 'first':
          this.currentPage.focusFirstResultsItem()
            .then(this.notifyOk(next), next);
          break;
        case 'last':
          this.currentPage.focusLastResultsItem()
            .then(this.notifyOk(next), next);
          break;
        default:
          next('Invalid positional for search result: ' + positional);
      }
    }
  );

  this.When(
    /focus on search result item "(.*)"/,
    function (positional, next) {
      this.currentPage.focusResultsItem(parseInt(positional))
        .then(this.notifyOk(next), next);
    }
  );

  this.Then(
    /the result "(.*)" is "(.*)"/,
    function (name, value, next) {
      expect(this.currentPage.focusedItem[name])
          .to.eventually.equal(value).and.notify(next);
    }
  );

};
