var options = libRequire('../options').ldap;

module.exports = {
  url: options.protocol +
      '://' + options.hostname +
      ':' + options.port,
  timeout: undefined, // inifinty TODO: fixme
  connectTimeout: undefined, // OS-determined TODO: fixme
  maxConnections: 3, // TODO: stress test to figure out
  bindDN: options.adminDn,
  bindCredentials: options.adminPassword,
  checkInterval: undefined, // TODO: research me
  maxIdleTime: undefined // TODO: research me
};
