module.exports = function () {
  this.World = World;

  this.Then(
    /filter criteria are set to their default values/,
    function(next) {
      expect(this.currentPage.filterCriteria)
        .to.eventually.have.deep.property(
          'model.filterCriteria.status', 'TODO'
        )
        .and.notify(next);
    }
  );
};
