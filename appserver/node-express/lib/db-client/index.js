var mlclient = require('marklogic');
var options = libRequire('../options').db;
var boundClients = {};

module.exports = function (user, password) {
  if (!boundClients[user]) {
    var modules = require('requireindex')(__dirname);
    var connection = mlclient.createDatabaseClient(_.merge(
      options.clientConnection,
      {
        user: user,
        password: password
      }
    ));
    // connections[role].setLogger({ console: false });

    var boundClient = {};

    // bind all functions to the user-specific client
    _.each(modules, function (mod, key) {
      boundClient[key] = mod.bind(connection);
    });
    boundClients[user] = boundClient;
  }
  return boundClients[user];
};



// db.getClientForRole = function (rolesMap, role) {
//   if (!connections[role]) {
//     connections[role] = mlclient.createDatabaseClient(_.merge(
//       options.db.clientConnection,
//       {
//         user: options.rolesMap[role].dbUser,
//         // TODO read this from a secure file or env variable
//         password: options.rolesMap[role].dbPassword
//       }
//     ));
//     // connections[role].setLogger({ console: false });
//   }
//   return connections[role];
// };
