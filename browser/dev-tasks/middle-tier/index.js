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
var shellCmd = function (cwd, command, signal, errorsOk, cb) {
  // duck typing arity
  if (!cb) {
    cb = signal;
    signal = null;
  }

  process.stdout.write(chalk.green('\n' + command));
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
    if (!signaled) {
      // process.stdout.write(data);
      process.stdout.write('.');
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
      else {
        process.stdout.write(data);
      }
    }
  };
  child.stdout.on('data', goodOutput);

  child.stderr.on('data', function (data) {
    if (!signaled) {
      if (errorsOk) {
        goodOutput(data);
      }
      else {
        process.stderr.write(chalk.red('\n' + data.trim()));
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
    console.log(chalk.magenta('reseting database, starting app server'));
    var pwd = shell.pwd();
    var dirForMiddle = path.join(
      ctx.paths.projectRoot, 'appserver/java-spring'
    );

    async.series([
      shellCmd.bind(null, dirForMiddle, './gradlew dbTeardown', null, true),
      shellCmd.bind(null, dirForMiddle, './gradlew dbConfigureClean'),
      shellCmd.bind(null, dirForMiddle, './gradlew dbInit'),
      shellCmd.bind(null, dirForMiddle, './gradlew dbLoad'),
      shellCmd.bind(
        null,
        dirForMiddle,
        './gradlew bootrun',
        'marklogic.samplestack.Application - Started Application'
      ),
    ], function (err, results) {
      console.log(' ');
      shell.cd(pwd);

      pokeServer(function () {
        console.log(chalk.magenta('preparations complete'));
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
