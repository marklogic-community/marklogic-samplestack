module.exports = function () {
  this.World = World;

  this.When(
    /I select the filter mine only/,
    function (next) {
      this.currentPage.addFilter('showMineOnly').then(next);
    }
  );

  this.When(
    /I select the filter resolved only/,
    function (next) {
      this.currentPage.addFilter('resolvedOnly').then(next);
    }
  );

  this.When(
    /I unselect the filter mine only/,
    function (next) {
      this.currentPage.removeFilter('showMineOnly').then(next);
    }
  );

  this.When(
    /I unselect the filter resolved only/,
    function (next) {
      this.currentPage.removeFilter('resolvedOnly').then(next);
    }
  );


};
