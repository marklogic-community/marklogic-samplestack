//.DO NOT TRY THE BELOW TECHNIQUE AT HONME.
// The use of the hookRequest is not recommended. It is a temporary workaround
// for Samplestack 1.1.0, to be used only as long as compatibility with Node
// Client version 1.0.1 is required.

var http = require('http');
var origRequest;
var origWrite;
var origClient;

var customWrite = function (interceder, chunk, encoding, callback) {
  var myChunk = interceder(chunk);
  return origWrite.call(origClient, myChunk, encoding, callback);
};

var replacementHttpRequest = function (interceder, options, callback) {
  var myOptions = interceder.optionsRewrite ?
      interceder.optionsRewrite(options) :
      options;

  origClient = origRequest(options, callback);
  if (origClient.write !== customWrite && interceder.chunkRewrite) {
    origWrite = origClient.write;
    origClient.write = customWrite.bind(origClient, interceder.chunkRewrite);
  }
  return origClient;
};

var hookHttpRequest = function (db, interceder) {
  origRequest = db.request;
  db.request = replacementHttpRequest.bind(null, interceder);
  return function () {
    db.request = origRequest;
  };
};

module.exports = {
  hook: hookHttpRequest
};
