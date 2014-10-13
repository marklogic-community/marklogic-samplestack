module.exports = function () {
  this.World = World;

  this.Given(/I am a contributor/, function (next) {
    next.pending();
  });

  this.Given(/I am a visitor/, function (next) {
    this.logout().then(next);
  });

};
