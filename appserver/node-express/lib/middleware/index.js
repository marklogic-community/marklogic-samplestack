module.exports = function (app) {
  var modules = require('requireindex')(__dirname);
  _.each(modules, function (mod, key) {
    mod.bind(app.locals.options);
    _.each(mod.errHandlers, function (handler) {
      app.use(handler);
    });
  });
  return modules;
};
