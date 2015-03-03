var path = require('path');

// all paths to libRequire are relative to the lib directory, hence very
// few upward traversals (options is the exception)
global.libRequire = function (name) {
  return require(path.resolve(__dirname, name));
};

var options = require('../options');

var express = require('express');
var app = express();

app.locals.options = options;

app.set('x-powered-by', false);

app.use(require('compression')({ threshold: 512 }));
app.use(require('cookie-parser')());

// we give the app over to the middleware so that we can put specific error
// handlers into the app as we define the middleware, even though technically
// the middleware itself won't live in the app. This lets us put our error
// handlers close to the code that is triggering the errors
var mw = libRequire('middleware')(app);
libRequire('routing')(app, mw);

// last error handler
var errorMsg = require('chalk').red('500 ERROR!');
app.use(function (err, req, res, next) {
  console.log(errorMsg);
  if (err.stack) {
    console.log(err.stack);
  }
  else {
    console.log(JSON.stringify(err, null, ' '));
  }
  res.status(500).send({ error: err });
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
