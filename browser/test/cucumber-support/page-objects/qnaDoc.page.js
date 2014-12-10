var utilities = require('../utilities');
var Metadata = require('./directives/QnaDocMetadata.dctv').Metadata;

function QnaDocPage () {
  var self = this;
  QnaDocPage.super_.call(self);
  self.url = '/doc';

  require('./dialogs/contributor.dlg').support(self);

  self.focusQuestion = function () {
    return self.qself(getQuestionElement().then(function (el) {
      self.focusedItem = {};
      return getQuestionMetadata().then(function (meta) {
        self.focusedItem.metadata = meta;
        return;
      });
    }));
  };

  /*******************************/
  /********** PRIVATE ************/
  /*******************************/
  var getQuestionElement = function () {
    return element(by.className('ss-question'));
  };

  var getQuestionMetadata = function () {
    return getQuestionElement().then(function (el) {
      return new Metadata(el, self);
    });
  };

}

var me = QnaDocPage;
me.pageName = 'qnadoc';
World.addPage(me);
