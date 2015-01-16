module.exports.support = function (obj) {

  Object.defineProperty(obj, 'contributorDisplayName', {
    get: function () {
      return element(by.className('ss-contributor-display-name'))
        .getText();
    }
  });

  Object.defineProperty(obj, 'contributorVotesCast', {
    get: function () {
      return element(by.className('ss-contributor-votes-cast'))
        .getText().then(function (txt) { return parseInt(txt); });
    }
  });

  Object.defineProperty(obj, 'contributorReputation', {
    get: function () {
      return element(by.className('ss-contributor-reputation'))
        .getText().then(function (txt) { return parseInt(txt); });
    }
  });

  obj.dismiss = function () {
    return element(by.className('close')).click();
  };

};
