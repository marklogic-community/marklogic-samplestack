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

// TODO: this file is more trouble than it's worth -- insist on
// cmd-line params or env vars

/*
The values here are used as credentials. This file is present in the
marklogic/marklogic-samplestack repository, but credentials are not supplied,
and changes to the file are ignored.

As such, you may enter and save your own credentials, or you can set
environment variables to read them dynamically. If a non-null value is
supplied, the environment variable will be ignored.
 */

module.exports = {
  // Use your SauceLabs credentials or create a new account under the
  // open-source licensing model at https://saucelabs.com/opensauce
  sauce: {
    // replace with your sauce username
    // or set 'SAUCE_USERNAME' env. variable
    // e.g.
    // user: 'my-sauce-account'
    user: null,

    // replace with your sauce access token
    // or set 'SAUCE_ACCESS_KEY' env. variable
    // e.g.
    // accessToken: '05fa46d0-a6df-4a08-a345-c3d3e2f24a61'
    accessToken: null
  }
};
