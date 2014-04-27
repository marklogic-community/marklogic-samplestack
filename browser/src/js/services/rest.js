define(['app', 'filters/restTranslate'], function(app) {
  var fact = {
    name: 'rest',
    definition: function($http, $q, fromServerFilter, toServerFilter) {
      var baseUrl = '<%= restUrl %>';

      var svc = {};

      svc.docs = {};

      // on would expect an object to come back that contains
      // summary information for the documents... so we'll pretend that
      // is what happens --these docs are so small that we'll have to
      // "imagine" bigness
      svc.docs.get = function() {
        var docs = [];
        var deferred = $q.defer();
        $http.get(baseUrl + '/foo').then(function(response) {
          var subPromises = [];
          _.forEach(response.data, function(data) {
            subPromises.push($http.get(baseUrl + data));
          }, deferred.reject);
          $q.all(subPromises).then(function(results) {
            _.forEach(results, function(result) {
              docs.push(fromServerFilter(result.data));
            });
            deferred.resolve(docs);
          }, deferred.reject);
        });

        return deferred.promise;
      };

      //this would be superfluous
      // var docs = {};
      // docs.getDoc = function(id) {
      //   var url = 'http://localhost:8080/foo/' + id;
      //   var promise = $http.get(url).then(function(response) {
      //     return response.data;
      //   });
      //   return promise;
      // };

      svc.docs.put = function(doc) {
        return $http.put(baseUrl + '/foo/' + doc.id, toServerFilter(doc));
      };



      // addDummyDoc = function() {
      //   var url = 'http://localhost:8080/foo';
      //   var id = Math.floor((Math.random() * 1000) + 1);
      //   var names = ['Colleen', 'Charles', 'Erik', 'Jim', 'Norm', 'Sam'];
      //   var nameKey = Math.floor(Math.random() * names.length);
      //   var promise = $http.post(
      //     url, '{"name": "' + names[nameKey] + '", "id": ' + id + '}'
      //   )
      //   .then(function(response) {
      //     return response.data;
      //   });
      //   return promise;
      // };
      svc.docs.delete = function(id) {
        return $http.delete(baseUrl + '/foo/' + id);
      };

      return svc;

    }

  };

  app.factory(fact.name, fact.definition);
});
