define(['app'], function(app) {
  var svc = {
    name: 'docs',
    definition: function($http) {

      var docs = {};
      docs.getDocs = function() {
        var url = 'http://localhost:8080/foo';
        var promise = $http.get(url).then(function(response) {
          return response.data;
        });
        return promise;
      };
      docs.getDoc = function(id) {
        var url = 'http://localhost:8080/foo/' + id;
        var promise = $http.get(url).then(function(response) {
          return response.data;
        });
        return promise;
      };
      docs.addDummyDoc = function() {
        var url = 'http://localhost:8080/foo';
        var id = Math.floor((Math.random() * 1000) + 1);
        var names = ['Colleen', 'Charles', 'Erik', 'Jim', 'Norm', 'Sam'];
        var nameKey = Math.floor(Math.random() * names.length);
        var promise = $http.post(
          url, '{"name": "' + names[nameKey] + '", "id": ' + id + '}'
        )
        .then(function(response) {
          return response.data;
        });
        return promise;
      };
      docs.deleteDoc = function(uri) {
        var url = 'http://localhost:8080' + uri;
        var promise = $http.delete(url).then(function(response) {
          return response.data;
        });
        return promise;
      };
      return docs;

    }

  };

  app.factory(svc.name, svc.definition);
  return svc.definition;
});
