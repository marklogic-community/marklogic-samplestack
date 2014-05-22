World.addPage({
  name: 'documents',
  aliases: ['search'],
  constructor: function () {
    this.url = '/';
    this.getFilterCriteria = function() {
      var deferred = q.defer();

      element(By.model('model.filterCriteria'))
        .$('.ml-json-scope')
        .getText().then(
          function(val) {
            deferred.resolve(JSON.parse(val));
          },
          deferred.reject
        );

      return deferred.promise;
    };
  }
});
