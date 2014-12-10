module.exports.Metadata = function (webElement, page) {
  var self = this;

  self.openContributorDialog = function () {
    return page.qself(getAuthorElement().element(by.css('a')).click());
  };

  Object.defineProperty(self, 'reputation', {
    get: function () {
      return getReputationElement().getText().then(function (rep) {
        return parseInt(rep);
      });
    }
  });

  /*******************************/
  /********** PRIVATE ************/
  /*******************************/

  var getAuthorLink = function () {
    return getAuthorElement().element(by.css('a'));
  };

  var getAuthorElement = function () {
    return getElement().element(by.className('ss-author'));
  };

  var getReputationElement = function () {
    return getElement().element(by.className('ss-reputation'));
  };

  var getElement = function () {
    return webElement.all(by.css('ss-qna-doc-metadata')).first();
  };

};
