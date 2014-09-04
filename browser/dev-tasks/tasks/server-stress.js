// TODO dovs
//
module.exports = [{
  name: 'server-stress',
  deps: [],
  func: function (cb) {

    var request = require('request').defaults({ timeout: 10000 });

    var responseCount = 0;
    var successCount = 0;
    var errCount = 0;
    var simultaneous = 4;
    var repetitions = 26;
    var numTries = 0;
    var handleResponse = function (err, response, body) {
      responseCount++;
      console.log(responseCount);
      if (err) {
        errCount++;
        console.log('err');
      }
      else {
        successCount++;
        console.log('ok');
      }
      if (responseCount === simultaneous * repetitions) {
        console.log('successCount: ' + successCount, 'errCount: ' + errCount);
        cb();
      }
    };
    var makeRequest = function () {
      numTries++;
      request.post({
        uri: 'http://localhost:8090/v1/search',
        json: {
          query: {
            qtext: ''
          }
        }
      }, handleResponse);

      if (numTries === simultaneous * repetitions) {
        clearInterval(interval);
      }
    };

    var interval = setInterval(function () {
      for (var i = 0; i < simultaneous; i++) {
        makeRequest();
      }
    }, 500);

  }
}];
