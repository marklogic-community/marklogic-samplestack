var path = require('path');
var _ = require('lodash');

var helper = require('../helper');

// make it easier to get to plugins
var $ = helper.$;

var ctx = require('../context');
var options = ctx.options;

var shell = require('shelljs');

var childProcess = require('child_process');
var chalk = require('chalk');

var linesToHold = [];
var errsToHold = [];

var shellCmd = function (cwd, command, signal, errorsOk, cb) {
  // duck typing arity
  if (!cb) {
    cb = signal;
    signal = null;
  }
  linesToHold.push(chalk.green(command));
  var backupWd = process.cwd();
  process.chdir(cwd);
  var child = shell.exec(command, { async: true, silent: true });
  process.chdir(backupWd);
  if (signal) {
    process.on('exit', function () {
      child.kill();
    });
  }

  child.on('close', function (exitCode) {
    child.kill();
    if (exitCode && !signaled && !errorsOk) {
      return cb(new Error('EXIT CODE: ' + exitCode));
    }
    else {
      return cb();
    }
  });

  var outBuff = '';
  var signaled = false;
  var goodOutput = function (data) {
    if (ctx.built && ctx.seleniumStarted || linesToHold) {
      linesToHold.forEach(function (line) {
        process.stdout.write('\n' + line);
      });
      linesToHold = [];
      process.stdout.write('.');
    }
    else {
      if (!linesToHold.length) {
        linesToHold.push('');
      }
      linesToHold[linesToHold.length - 1] += '.';
    }

    var message = '';
    outBuff += data;
    if (outBuff.indexOf('\n') > -1) {
      message = outBuff.substr(0, outBuff.indexOf('\n') + 1);
      outBuff = outBuff.substr(outBuff.indexOf('\n') + 1);
      if (!signaled && signal && data.indexOf(signal) > -1) {
        signaled = true;
        return cb(null, child);
      }
      // else {
      //   process.stdout.write(data);
      // }
    }
  };
  child.stdout.on('data', goodOutput);

  child.stderr.on('data', function (data) {
    if (!signaled) {
      if (errorsOk) {
        goodOutput(data);
      }
      else {
        linesToHold.push(chalk.red(data.trim()));
      }
    }
  });
};


var pokeServer = function (cb) {
  var request = require('request');
  request.post(
    ctx.options.envs.e2e.addresses.appServer.href + 'v1/search',
    { json: {} },
    cb
  );
};

var setup = function (platform, cb) {
  if (platform === 'external') {
    return cb();
  }

  var async = require('async');
  if (platform === 'java') {
    $.util.log(chalk.magenta('reseting database, starting app server'));
    var pwd = shell.pwd();
    var dirForMiddle = path.join(
      ctx.paths.projectRoot, 'appserver/java-spring'
    );

    async.series([
      // shellCmd.bind(null, dirForMiddle, 'mlvm stop', null, true),
      // shellCmd.bind(null, dirForMiddle, 'mlvm start', null, true),
      shellCmd.bind(null, dirForMiddle, './gradlew dbTeardown', null, true),
      shellCmd.bind(
        null, dirForMiddle, './gradlew dbConfigureClean', null, true
      ),
      shellCmd.bind(null, dirForMiddle, './gradlew clean', null, true),
      shellCmd.bind(null, dirForMiddle, './gradlew dbinit', null, true),
      shellCmd.bind(null, dirForMiddle, './gradlew dbconfigure', null, true),
      shellCmd.bind(null, dirForMiddle, './gradlew test', null, true),
      shellCmd.bind(null, dirForMiddle, './gradlew dbload', null, true),
      shellCmd.bind(
        null,
        dirForMiddle,
        './gradlew bootrun',
        'Started Application in ',
        false
      ),
    ], function (err, results) {

      pokeServer(function () {
        $.util.log(chalk.magenta('preparations complete'));
        cb(err, results[results.length - 1]);

      });
    });
  }
  else {
    cb(new Error('node e2e not implemented'));
  }
};

module.exports = {
  setup: setup
};
