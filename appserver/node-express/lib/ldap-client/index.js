
var boundMods = {};
module.exports = function (app) {
  var config = require('./config');
  var connection = require('ldapjs').createClient(config);
  return {
    getUserRoles: require('./getUserRoles').bind(connection)
  };
};
