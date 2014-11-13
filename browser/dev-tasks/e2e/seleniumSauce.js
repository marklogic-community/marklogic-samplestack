var url = require('url');

var sauceConnectLauncher = require('sauce-connect-launcher');
var helper = require('../helper');
var $ = helper.$;

var ctx = require('../context');
var sauceProcess;

var sauceStart = function (args, cb) {
  ctx.seleniumStarted = false;
  sauceConnectLauncher({
    username: ctx.options.sauceCredentials.user,
    //'stu-salsbury',
    accessKey: ctx.options.sauceCredentials.accessKey,
  }, function (err, sauceConnectProcess) {
    if (err) { return cb(err); }
    sauceProcess = sauceConnectProcess;
    process.stdout.write('\n');

    ctx.setActiveServer('selenium', {
      url: url.parse('localhost:4445/wd/hub'),
      close: function (cb) {
        process.stdout.write('shutting down Sauce Connect\n');
        sauceProcess.on('exit', function () {
          cb();
        });
        sauceProcess.kill();
      }
    });

    $.util.log('Sauce Connect ready');
    ctx.seleniumStarted = true;
    cb();
  });
};

module.exports = {
  start: sauceStart
};
