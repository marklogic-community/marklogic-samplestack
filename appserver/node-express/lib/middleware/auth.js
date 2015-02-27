var options = libRequire('../options');

var authentication = libRequire('./authentication');
var authorization = require('./authorization');

module.exports = {
  roles: {
    getRole: function (role, req, res, next) {
      authorization.roles([ role ])(req, res, next);
    },
    getBestRole: function (roles, req, res, next) {
      authorization.roles(roles)(req, res, next);
    }
  },
  somethingElse: null
};
