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
      svc.docs.get = function(id) {
        var deferred = $q.defer();
        if (id) {
          $http.get(baseUrl + '/foo/' + id).then(function(response) {
            response.data.id = id;
            deferred.resolve(fromServerFilter(response.data));
          }, deferred.reject);
        }
        else {
          var docs = [];
          $http.get(baseUrl + '/foo').then(function(response) {
            var subPromises = [];
            _.forEach(response.data, function(data) {
              var id = /\/foo\/(.*)/.exec(data)[1];
              subPromises.push(svc.docs.get(id));
            }, deferred.reject);
            deferred.resolve($q.all(subPromises));
          });
        }

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

      //this would be superfluous
      // var docs = {};
      // docs.getDoc = function(id) {
      //   var url = 'http://localhost:8080/foo/' + id;
      //   var promise = $http.get(url).then(function(response) {
      //     return response.data;
      //   });
      //   return promise;
      // };

      svc.docs.post = function(doc) {
        var deferred = $q.defer();
        $http.get(baseUrl + '/foo/new').then(function(resp) {
          doc.id = resp.data.id.toString();
          svc.docs.put(doc).then(function(resp) {
            deferred.resolve(doc.id);
          }, deferred.reject);
        }, deferred.reject);
        return deferred.promise;
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
