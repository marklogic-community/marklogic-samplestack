define([
  './_defaultLayout', 'dialogs/speech', 'services/rest'
], function(parent, speechDialog) {

  var state = {
    name: 'home',
    definition: {
      url: '/',

      controller: function($scope, rest, dialogs) {

        var launchDialog = function(doc) {
          var isNew = _.isUndefined(doc);
          var di = dialogs.create(
            speechDialog.templateUrl,
            speechDialog.controllerName,
            {
              model: _.cloneDeep(doc || {}),
              isNew: isNew
            },
            {
              keyboard: false
            }
          );

          di.result.then(
            // closed as save
            function save(docOut) {
              docOut.wordCount = null;
              $scope.wordCount(docOut);
              if (isNew) {
                $scope.addDoc(docOut);
              }
              else {
                _.merge(doc, docOut);
                $scope.saveDoc(doc);
              }
            },
            // closed as cancel
            function cancel() {
              //noop
            }
          );
        };

        rest.docs.get().then(function(data) {
          $scope.docs = data;
        }, function(err) {
          console.log(JSON.stringify(err, null, ' '));
        });

        $scope.wordCount = function(doc) {
          return doc.body.wordCount ?
              doc.body.wordCount :
              doc.body.wordCount = doc.body.match(/\S+/g).length;
        };

        $scope.pointsPerWord = function(doc) {
          return '' +
              ((doc.rating * 1000) / $scope.wordCount(doc)).toFixed(1) +
              'x10^-3';
        };



        $scope.newDoc = function() {
          launchDialog();
        };

        $scope.docClick = function(doc, index) {
          launchDialog(doc);
        };

        $scope.addDoc = function(doc) {
          // $scope.docs = null;
          rest.docs.post(doc).then(function(data) {
            $scope.docs.push(doc);
          }, function(err) {
            console.log(JSON.stringify(err, null, ' '));
          });
        };

        $scope.saveDoc = function(doc) {
          // $scope.docs = null;
          rest.docs.put(doc).then(function(data) {
            //noop
          }, function(err) {
            console.log(JSON.stringify(err, null, ' '));
          });
        };

        $scope.deleteDoc = function(doc) {
          $scope.docs = null;
          rest.docs.delete(doc.id).then(function(data) {
            rest.docs.get().then(function(data) {
              $scope.docs = data;
            }, function(err) {
              console.log(JSON.stringify(err, null, ' '));
            });
          }, function(err) {
            console.log(JSON.stringify(err, null, ' '));
          });
        };

      }
    }
  };

  return parent.addChild(state.name, state.definition);
});
