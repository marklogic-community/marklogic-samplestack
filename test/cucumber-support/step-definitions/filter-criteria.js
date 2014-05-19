module.exports = function () {
  this.World = World;

  this.Then(
    /filter criteria are set to their default values/,
    function(callback) {
      callback.pending();
    });
};
