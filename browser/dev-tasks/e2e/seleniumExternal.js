var url = require('url');
var ctx = require('../context');

module.exports = {
  start: function (args, cb) {
    ctx.setActiveServer('selenium', {
      close: function (cb) { cb(); },
      url: url.parse(args.seleniumAddress)
    });
    ctx.seleniumStarted = true;
    cb();
  }
};
