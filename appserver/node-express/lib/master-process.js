/*

see http://mervine.net/clustering-in-nodejs , which explains what this module
does.

 */

var run = function () {
  var options = require('../options');

  /**
   * Libraries
   **/
  var cluster = require('cluster');
  var moment = require('moment');
  var path = require('path');
  global.libRequire = function (name) {
    return require(path.resolve(__dirname, name));
  };


  if (options.ldap.useBuiltInServer) {
    require('./ldapWorker');
  }

  /**
   * Setup
   * for thread count, use configured value if available. If not, use one
   * less than the number of cpu cores, or if single-core, use one worker
   **/
  var numWorkers = options.numWorkers ||
      require('os').cpus().length - 1 || // otherwise use one less than number
      1;

  if (numWorkers === 1) {
    require('./samplestackWorker');
  }
  else {
    cluster.setupMaster({
      exec : 'lib/server.js',
    });

    /**
     * Utilities
     **/
    var say = function (message) {
      console.log('[SERVER] ' + message);
    };

    /**
     * Startup Messaging
     **/
    say('Master starting:');
    say('time        => ' + moment().toISOString());
    say('pid         => ' + process.pid);
    say('environment => ' + process.env.NODE_ENV);

    /**
     * Fork Workers
     **/
    say('Workers starting:');

    for (var i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    /**
     * Worker Event Handlers
     **/
    cluster.on('exit', function (worker, code, signal) {
      say(
        'worker      => with pid: ' + worker.process.pid +
            ', died (' + code + '). Restarting...'
      );
      cluster.fork();
    });

    cluster.on('online', function (worker) {
      say('worker      => start with pid: ' + worker.process.pid + '.');
      say('time        => ' + moment().toISOString());
    });
  }

};

module.exports = {
  run: run
};
