define(['app/module'], function (module) {

  /*
   * @ngdoc directive
   * @name ssQnaDocMetadata
   * @restrict E
   *
   * @description
   */
  module.directive('ssQnaDocMetadata', [

    '$parse',
    'mlUtil',
    function (
      $parse,
      mlUtil
    ) {
      return {
        restrict: 'E',
        templateUrl: '/app/directives/ssQnaDocMetadata.html',
        scope: {
          doc: '=doc',
          docType: '@docType'
        },
        link: function (scope) {
          var unregister = scope.$watch('doc', function (newVal, oldVal) {
            if (newVal) {
              unregister();
              scope.showContributor = function () {
                scope.$emit(
                  'showContributor',
                  {
                    contributorId: scope.doc.owner.id
                  }
                );
              };
              scope.isLocalOwner = function () {
                var n = scope.doc.owner ?
                    scope.doc.owner.displayName :
                    '';
                return n === 'joeUser' || n === 'maryAdmin';
              };

              scope.soOwnerId = function () {
                return scope.isLocalOwner() ?
                    null :
                    $parse('doc.owner.id')(scope);
              };

              scope.soUserName = function () {
                return scope.soOwnerId() ?
                    scope.doc.owner.displayName :
                    null;
              };

              scope.soUserLink = function () {
                return scope.soOwnerId() && scope.doc.owner.id ?
                    'http://stackoverflow.com/users/' + scope.doc.owner.id :
                    null;
              };

              scope.noValidUser = function () {
                var noneValid = !scope.soOwnerId() && !scope.isLocalOwner();
                return noneValid;
              };
              scope.formatDate = function (str) {
                if (str && str.length) {
                  var date = mlUtil.moment(str);
                  return date.format('MMM D, \'YY') +
                      ' at ' + date.format('h:mm');

                }
              };

            }
          });

        }
      };
    }
  ]);
});
