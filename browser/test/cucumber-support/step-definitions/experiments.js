module.exports = function () {
  this.World = World;

  this.Given(
    /a test fails/,
    function (next) {
      expect(true).to.equal(false);
      next();
    }
  );

};
