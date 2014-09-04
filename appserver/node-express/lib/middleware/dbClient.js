var mlclient = require('marklogic');
var options = libRequire('../options');
var connections = {};

var getConnectionForRole = function (role) {
  if (!connections[role]) {
    connections[role] = mlclient.createDatabaseClient(_.merge(
      options.db.clientConnection,
      {
        user: options.rolesMap[role].dbUser,
        // TODO read this from a secure file or env variable
        password: options.rolesMap[role].dbPassword
      }
    ));
    // connections[role].setLogger({ console: false });
  }
  return connections[role];
};

module.exports = function (req, res, next) {
  req.db = getConnectionForRole(req.role.name);
  next();
};
