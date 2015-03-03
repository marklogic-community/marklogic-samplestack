module.exports = function (app) {
  var modules = {};
  var moduleFuncs = require('requireindex')(__dirname);
  _.each(moduleFuncs, function (modFunc, key) {
    // mod.bind(app.locals.options);
    var funcs = modFunc(app);
    modules[key] = funcs;
  });
  return modules;
};
