(function (undefined) {

  this.app.controller('speechesCtlr', [

    '$scope', 'rest', 'speechDialog',
    function ($scope, rest, speechDialog) {

      var launchDialog = function (doc) {
        var isNew = _.isUndefined(doc);

        var dialogResult = speechDialog({
          model: _.cloneDeep(doc || {}),
          isNew: isNew
        });

        dialogResult.then(
          // closed as save
          function save (docOut) {
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
          // closed as cancel -- this coud be ommitted
          function cancel () {
            //noop
          }
        );
      };

      rest.docs.get().then(function (data) {
        $scope.docs = data;
      }, function (err) {
        throw new Error(JSON.stringify(err));
      });

      $scope.wordCount = function (doc) {
        return doc.body.wordCount ?
            doc.body.wordCount :
            doc.body.wordCount = doc.body.match(/\S+/g).length;
      };

      $scope.pointsPerWord = function (doc) {
        var calc = ((doc.rating * 1000) / $scope.wordCount(doc)).toFixed(1);
        return calc.toString() + 'x10^-3';
      };

      $scope.newDoc = function () {
        launchDialog();
      };

      $scope.docClick = function (doc, index) {
        launchDialog(doc);
      };

      $scope.addDoc = function (doc) {
        // $scope.docs = null;
        rest.docs.post(doc).then(function (data) {
          $scope.docs.push(doc);
        }, function (err) {
          throw new Error(JSON.stringify(err));
        });
      };

      $scope.saveDoc = function (doc) {
        // $scope.docs = null;
        rest.docs.put(doc).then(function (data) {
          //noop
        }, function (err) {
          throw new Error(JSON.stringify(err));
        });
      };

      $scope.deleteDoc = function (doc) {
        $scope.docs = null;
        rest.docs.delete(doc.id).then(
          function (data) {
            rest.docs.get().then(
              function (data) {
                $scope.docs = data;
              },
              function (err) {
                throw new Error(JSON.stringify(err));
              }
            );
          },
          function (err) {
            throw new Error(JSON.stringify(err));
          }
        );
      };
    }
  ]);

}).call(global);
