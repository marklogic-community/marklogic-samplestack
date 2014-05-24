module.exports = function () {
  this.World = World;

  this.Given(/I am a contributor/, function(callback) {
    callback.pending();
  });

  this.Given(/I am a guest/, function(callback) {
    callback.pending();
  });

};
