var chalk = require('chalk');

var logError = function (message) {
  console.log(chalk.red('ERROR!'));
  console.log(message);
};

module.exports = {
  error: function (status, error) {
    if (error.stack) {
      logError(error.stack);
    }
    else {
      logError(JSON.stringify(error, null, ' '));
    }
  }
};
