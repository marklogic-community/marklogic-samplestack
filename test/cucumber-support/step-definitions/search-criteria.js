module.exports = function () {
  this.World = World;

  this.Then(
    /search criteria is empty/,
    function(callback) {
      callback.pending();
    }
  );
};
