module.exports = function (app, mw) {
  var modules = {
    contributor: require('./contributor'),
    question: require('./question'),
    session: require('./session'),
    search: require('./search'),
    tags: require('./tags')
  };
  _.each(modules, function (mod) {
    mod(app, mw);
  });
};
