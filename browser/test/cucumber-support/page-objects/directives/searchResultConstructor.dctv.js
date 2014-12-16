var Metadata = require('./qnaDocMetadataConstructor.dctv').Metadata;

module.exports.SearchResult = function (webElement, page) {
  var self = this;

  /*******************************/
  /******** PUBLIC API ***********/
  /*******************************/

  self.metadata = new Metadata(webElement, page);

  Object.defineProperty(self, 'title', {
    get: function () {
      return webElement.element(by.className('ss-result-title'))
          .getText();
    }
  });

  /*******************************/
  /********** PRIVATE ************/
  /*******************************/

};
