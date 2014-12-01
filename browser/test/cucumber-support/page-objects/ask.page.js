function AskPage () {
  AskPage.super_.call(this);
  this.url = '/ask';

  Object.defineProperty(this, 'titleText', {
    get: function () {
      return q(element(by.model('qnaDoc.title'))
      .getText());
    }
  });

}

var self = AskPage;

self.name = 'ask';
World.addPage(self);
