World.addPage({
  name: 'explore',
  aliases: ['search'],
  constructor: function () {
    this.url = '/';

    Object.defineProperty(this, 'queryText', {
      get: function () {
        return q(element(by.model('searchbarText'))
          .getText());
      }
    });

    Object.defineProperty(this, 'docsCount', {
      get: function () {
        return q(element(by.className('ss-search-results-count'))
          .getText()
          .then(function (text) {
            return text.replace(/,/, '');
          })
        );
      }
    });

  }
});
