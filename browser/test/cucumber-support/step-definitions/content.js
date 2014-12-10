module.exports = function () {
  this.World = World;

  this.When(
    /view the content contributor/,
    function (next) {
      var notify = this.notifyOk;

      if (this.currentPage.focusedItem) {
        this.currentPage.focusedItem.metadata.openContributorDialog()
          .then(this.notifyOk(next), next);
      }
      else {
        next('Attempt to view a content contributor when no supported ' +
            ' element is focused'
        );
      }
    }
  );
};
