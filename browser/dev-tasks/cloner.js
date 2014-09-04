var through2 = require('through2');

module.exports = function () {
  var cloned = through2.obj();
  var cloner = through2.obj(
    function (file, enc, cb) {
      cloned.write(file.clone());
      this.push(file);
      cb();
    },
    function (cb) { cloned.end(); cb(); }
  );
  cloner.cloned = cloned;
  return cloner;
};
