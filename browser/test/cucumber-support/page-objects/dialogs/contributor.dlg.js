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
        .getText();
    }
  });

  Object.defineProperty(obj, 'contributorReputation', {
    get: function () {
      return element(by.className('ss-contributor-reputation'))
        .getText();
    }
  });


};
