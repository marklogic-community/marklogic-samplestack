module.exports.Metadata = function (webElement, page) {
  var self = this;

  self.openContributorDialog = function () {
    return page.qself(getAuthorElement().element(by.css('a')).click());
  };


  /*******************************/
  /********** PRIVATE ************/
  /*******************************/

  var getAuthorLink = function () {
    return getAuthorElement().element(by.css('a'));
  };

  var getAuthorElement = function () {
    return getElement().element(by.className('ss-author'));
  };

  var getElement = function () {
    return webElement.all(by.css('ss-qna-doc-metadata')).first();
  };

};
