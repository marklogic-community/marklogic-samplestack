var path = require('path');


// all paths to libRequire are relative to the lib directory, hence very
// few upward traversals (options is the exception)
global.libRequire = function (name) {
  return require(path.resolve(__dirname, name));
};

var options = libRequire('../options');

var express = require('express');
var app = express();

app.set('x-powered-by', false);

app.use(require('compression')({ threshold: 512 }));

app.use(require('cookie-parser')());

libRequire('authentication')(app);

var auth = libRequire('authorization');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var passport = require('passport');

var mw = libRequire('middleware');
var csrf = require('csurf');

// respond to POSTs to this address
app.post('/v1/session', [
  // parse a url-encoded body
  urlencodedParser,
  // use the passportjs library to check authentication against ldap
  passport.authenticate('ldapauth'),
  // if the user is in the contributors role, assume that role for DB
  // connection purposes, otherwise return 401
  auth.roles(['contributors']),
  // set CSRF header if configured to do so
  mw.csrf.set,
  // get a dbclient instance fitting the role set above
  mw.dbClient,
  // retrieve and return  information about the user
  mw.userInfo
]);

app.get('/v1/contributors/:id', [
  mw.dbClient,
  mw.userInfo
]);

app.post('/v1/search', [
  mw.csrf.conditionalCheck,
  jsonParser,
  auth.roles(['contributors', 'default']),
  mw.dbClient,
  // mw.searchQnaDocs
]);

app.post('/v1/questions', [
  mw.csrf.conditionalCheck,
  auth.roles(['contributors']),
  mw.dbClient,
  mw.askQuestion
]);

_.forEach(libRequire('error-handlers'), function (errHandler) {
  app.use(errHandler);
});

var listener;
if (options.https) {
  listener = require('https').createServer(options.https, app)
      .listen(options.port, options.hostname);
}
else {
  listener = require('http').createServer(app)
      .listen(options.port, options.hostname);
}

process.on('exit', function () {
  listener.close();
});
