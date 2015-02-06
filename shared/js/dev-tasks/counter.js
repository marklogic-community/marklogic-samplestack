var through2 = require('through2');
var helper = require('./helper');

module.exports = function () {
  var count = 0;
  return through2.obj(
    function (file, enc, cb) {
      if (count === 0) {
        helper.$.util.log('processing files');
      }
      count++;
      this.push(file);
      cb();
    },
    function (cb) {
      helper.$.util.log('saw ' + count + ' files');
      cb();
    }
  );
};
