/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

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
