module.exports = function (app, mw) {
  var modules = require('requireindex')(__dirname);
  _.each(modules, function (mod) {
    mod(app, mw);
  });
};
