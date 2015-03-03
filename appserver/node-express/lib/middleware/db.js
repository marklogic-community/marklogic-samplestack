var path = require('path');
var options = libRequire('../options');

// one per db user
var connections = {};

module.exports = function (app) {
  return {
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
    },
    setBestClientForRoles: function (roles, req, res, next) {
      try {
        _.each(roles, function (role) {
          if (req.session.roles[role]) {
            var user = options.rolesMap[role].dbUser;
            var password = options.rolesMap[role].dbPassword;
            var db = libRequire('db-client')(user, password);
            req.db = db;
            return false;
          }
        });
      }
      catch (err) {
        return next(err);
      }
      if (!req.db) {
        next({
          status: 403,
          error: 'permissions',
          description: 'Insufficient privileges.'}
        );
      }
      else {
        next();
      }
    }
  };

};
