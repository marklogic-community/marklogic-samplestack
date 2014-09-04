define(['app/module'], function (module) {

  /*
   * @ngdoc directive
   * @name ssQnaDocMetadata
   * @restrict E
   *
   * @description
   * Directive for displaying metadata in QnA document view.
   */
  module.directive('ssQnaDocMetadata', [

    '$parse',
    'mlUtil',
    'appRouting',
    function (
      $parse,
      mlUtil,
      appRouting
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
              // On contributor click, dispatch event to _root.js
              scope.showContributor = function () {
                scope.$emit(
                  'showContributor',
                  {
                    contributorId: scope.doc.owner.id
                  }
                );
              };
              // Check if document owner is from Samplestack
              scope.isLocalOwner = function () {
                var n = scope.doc.owner ?
                    scope.doc.owner.displayName :
                    '';
                return n === 'joeUser' || n === 'maryAdmin';
              };
              // Return document's Stackoverflow owner ID
              scope.soOwnerId = function () {
                return scope.isLocalOwner() ?
                    null :
                    $parse('doc.owner.id')(scope);
              };
              // Return document's Stackoverflow display name
              scope.soUserName = function () {
                return scope.soOwnerId() ?
                    scope.doc.owner.displayName :
                    null;
              };
              // Return link to Stackoverflow user page
              scope.soUserLink = function () {
                return scope.soOwnerId() && scope.doc.owner.id ?
                    'http://stackoverflow.com/users/' + scope.doc.owner.id :
                    null;
              };
              // Is document user valid?
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

              scope.goTag = function (tag) {
                appRouting.go(
                  'root.layout.explore.results',
                  { tags: tag }
                );
              };

            }
          });

        }
      };
    }
  ]);
});
