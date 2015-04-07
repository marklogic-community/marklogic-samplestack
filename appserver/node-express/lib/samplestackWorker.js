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

var path = require('path');

// all paths to libRequire are relative to the lib directory, hence very
// few upward traversals (options is the exception)
global.libRequire = function (name) {
  return require(path.resolve(__dirname, name));
};
global.sharedRequire = function (name) {
  return require(path.resolve(__dirname, '../../../shared', name));
};

var options = sharedRequire('js/options');
var mon = libRequire('monitoring');
var express = require('express');


// configure Express
var app = express();

// don't advertise the server technology
app.set('x-powered-by', false);

// above 1024 bytes, use compression (this is te default)
app.use(require('compression')({ threshold: 1024 }));

var browserBuilt = path.resolve(__dirname, '../../../browser/builds/built');
var serveStaticDir = express.static(browserBuilt);

app.use(/^(?!\/v1\/)/, function (req, res, next) {
  if (req.path.indexOf('.') < 0) {
    req.url = '/index.html';
  }
  serveStaticDir(req, res, next);
});

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
if (options.middleTier.https) {
  listener = require('https').createServer(options.middleTier.https, app)
      .listen(options.middleTier.port, options.midleTier.hostname);
}
else {
  listener = require('http').createServer(app)
      .listen(options.middleTier.port, options.middleTier.hostname);
}

process.on('exit', function () {
  listener.close();
});

module.exports = {
  stop: function () { listener.close(); }
};
