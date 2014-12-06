module.exports = function () {
  this.World = World;

  this.When(
    /perform a search for "(.*)"/,
    function (searchText, next) {
      this.currentPage.search(searchText)
        .then(this.notifyOk(next), next);
    }
  );

  this.When(
    /clear the search text/,
    function (next) {
      this.currentPage.clearSearchText()
        .then(this.notifyOk(next), next);
    }
  );

};
