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

  Object.defineProperty(self, 'questionVotes', {
    get: function () {
      return getQuestionVotesElement.element(by.className('ss-vote-count'))
        .getText()
        .then(function (votes) { return parseInt(votes); });
    }
  });

  Object.defineProperty(self, 'questionVoteUp', {
    get: function () {
      return self.qself(
        getQuestionVotesElement.element(by.className('ss-up'))
          .click()
      );
    }
  });

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

  var getQuestionVotesElement = function () {
    return getQuestionElement().element(by.className('ss-vote'));
  };

}

var me = QnaDocPage;
me.pageName = 'qnadoc';
World.addPage(me);
