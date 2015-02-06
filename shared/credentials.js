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
