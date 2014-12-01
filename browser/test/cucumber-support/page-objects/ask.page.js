function AskPage () {
  var self = this;
  AskPage.super_.call(self);
  self.url = '/ask';

  Object.defineProperty(self, 'qnaQuestionTitleElement', {
    get: function () {
      return element(by.model('qnaDoc.title'));
    }
  });

  Object.defineProperty(self, 'qnaQuestionTitle', {
    get: function () {
      return self.qnaQuestionTitleElement.getText();
    }
  });
}

var me = AskPage;
me.pageName = 'ask';
World.addPage(me);
