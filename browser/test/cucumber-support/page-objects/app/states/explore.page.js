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

  }
});
