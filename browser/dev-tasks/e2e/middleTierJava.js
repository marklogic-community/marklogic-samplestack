var path = require('path');
var _ = require('lodash');

var helper = require('../helper');
var $ = helper.$;

var ctx = require('../context');
var options = ctx.options;

var shell = require('shelljs');

var childProcess = require('child_process');
var chalk = require('chalk');
var gradleCmd = /^win/.test(process.platform) ? 'gradlew.bat' : './gradlew';

// if custom seed data version is on command line, get from there
var customSeed = require('yargs').argv.seed;

var shellCmd = function (cwd, command, signal, cb) {
  process.stdout.write(chalk.green('\n' + command + '\n'));
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
    if (exitCode && !signaled) {
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
      // else {
      //   process.stdout.write(
      //     'signaled' + signaled +
      //     ' signal' + signal + ' ' +
      //     data
      //   );
      // }
    }
  };
  child.stdout.on('data', goodOutput);

  child.stderr.on('data', function (data) {
    if (!signaled) {
      process.stdout.write(chalk.red('\n' + data.trim()));
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

var start = function (args, cb) {
  var async = require('async');
  console.log(chalk.magenta('reseting database, starting app server'));
  var pwd = shell.pwd();
  var dirForMiddle = path.join(
    ctx.paths.projectRoot, 'appserver/java-spring'
  );

  var seedFile = path.resolve(
    process.cwd(), '..', 'seed-data' + customSeed + '.tgz'
  );

  var dbLoadParam = customSeed ?
      ' -PseedDataUrl=file://' + seedFile :
      '';
  var loadCmd = gradleCmd + ' dbLoad' + dbLoadParam;

  async.series([
    shellCmd.bind(null, dirForMiddle, gradleCmd + ' dbInit', null),
    shellCmd.bind(null, dirForMiddle, gradleCmd + ' dbTeardown', null),
    shellCmd.bind(null, dirForMiddle, gradleCmd + ' dbInit', null),
    shellCmd.bind(null, dirForMiddle, gradleCmd + ' dbConfigure', null),
    shellCmd.bind(null, dirForMiddle, gradleCmd + ' test', null),
    shellCmd.bind(
      null, dirForMiddle, loadCmd, null
    ),
    shellCmd.bind(
      null,
      dirForMiddle,
      gradleCmd + ' bootrun',
      'marklogic.samplestack.Application - Started Application'
    ),
  ], function (err, results) {
    console.log(' ');
    $.util.log(chalk.green('detected middle tier started'));
    var mtServer = results[results.length - 1];
    ctx.setActiveServer('middle-tier', {
      close: function (cb) {
        console.log('shutting down Java middle tier');
        mtServer.on('exit', function () {
          cb();
        });
        mtServer.kill();
      }
    });

    pokeServer(function () {
      console.log(chalk.magenta('preparations complete'));
      cb(err);

    });
  });
};

module.exports = {
  start: start
};
