var path = require('path');
var options = require('../options');
var mon = libRequire('monitoring');
var express = require('express');

// all paths to libRequire are relative to the lib directory, hence very
// few upward traversals (options is the exception)
global.libRequire = function (name) {
  return require(path.resolve(__dirname, name));
};

// configure Express
var app = express();

// don't advertise the server technology
app.set('x-powered-by', false);

// above 1024 bytes, use compression (this is te default)
app.use(require('compression')({ threshold: 1024 }));

// read/parse cookies all the time on REST endpoints
app.use('/v1/', require('cookie-parser')());


// we give the app over to the middleware so that we can put specific error
// handlers into the app as we define the middleware, even though technically
// the middleware itself won't live in the app. This lets us put our error
// handlers close to the code that is triggering the errors
//
// THESE TWO LINES ARE WHERE THE MAJORITY OF THE APP IS LOADED/CONFIGURED
var mw = libRequire('middleware')(app);
libRequire('routing')(app, mw);

// THE VERY LAST FAILSAFE ERROR HANDLER for rest endpoints
app.use('/v1/', function (err, req, res, next) {
  if (err.status){
    res.status(err.status).send( {error: err });
  }
  else {
    if (err.statusCode){
      res.status(err.statusCode).send( {
        message: err.body.errorResponse.message,
      });
    }
    else {
      mon.error(500, err);
      res.status(500).send({ error: err });
    }
  }
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
