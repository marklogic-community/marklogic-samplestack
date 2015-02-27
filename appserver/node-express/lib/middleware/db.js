var path = require('path');
var options = libRequire('../options').db;

// one per db user
var connections = {};

module.exports = {
  setClientForRole: function (role, req, res, next) {
    try {
      var user = options.rolesMap[role].dbUser;
      var password = options.rolesMap[role].dbPassword;
      var db = libRequire('db-client')(user, password);
      req.db = db;
      next();
    }
    catch (err) {
      next(err);
    }
  }
};
