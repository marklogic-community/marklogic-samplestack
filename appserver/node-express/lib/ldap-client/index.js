var modules = require('requireindex')(__dirname);

var connection;

module.exports = function (options) {
  var boundMods = {};
  if (!connection) {

    connection = require('ldapjs').createClient({
      url: options.prototcol +
          '://' + options.hostname +
          ':' + options.port,
      timeout: undefined, // inifinty TODO: fixme
      connectTimeout: undefined, // OS-determined TODO: fixme
      maxConnections: 3, // TODO: stress test to figure out
      bindDN: options.adminDn,
      bindCredentials: options.adminPassword,
      checkInterval: undefined, // TODO: research me
      maxIdleTime: undefined // TODO: research me
    });

    // bind all functions to the user-specific client
    _.each(modules, function (mod, key) {
      boundMods[key] = mod.bind(connection);
    });
  }
  // we have some options that we need after startup, so hang onto them
  boundMods.options = options;
  return boundMods;
};
