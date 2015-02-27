var mlclient = require('marklogic');
var options = libRequire('../options').db;
var connections = {};

module.exports = function (user, password) {
  var boundMods  = {};
  if (!connections[user]) {
    var modules = require('requireindex')(__dirname);
    connections[user] = mlclient.createDatabaseClient(_.merge(
      options,
      {
        user: user,
        password: password
      }
    ));
    // connections[role].setLogger({ console: false });


    // bind all functions to the user-specific client
    _.each(modules, function (mod, key) {
      boundMods[key] = mod.bind(connections[user]);
    });
  }
  return boundMods;
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
