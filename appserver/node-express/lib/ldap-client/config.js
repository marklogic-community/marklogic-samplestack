var options = sharedRequire('js/options');

var ldapOptions = options.middleTier.ldap;

module.exports = {
  url: ldapOptions.protocol +
      '://' + ldapOptions.hostname +
      ':' + ldapOptions.port,
  timeout: undefined, // inifinty TODO: fixme
  connectTimeout: undefined, // OS-determined TODO: fixme
  maxConnections: 3, // TODO: stress test to figure out
  bindDN: ldapOptions.adminDn,
  bindCredentials: ldapOptions.adminPassword,
  checkInterval: undefined, // TODO: research me
  maxIdleTime: undefined // TODO: research me
};
