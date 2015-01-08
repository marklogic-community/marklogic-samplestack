define(['app/module'], function (module) {

  /*
   * @ngdoc directive
   * @name ssQnaDocMetadata
   * @restrict E
   * @description
   * Directive for displaying metadata in QnA document view. Provides helper
   * functions used to generate the UI element content.
   *
   * <p style="color: red">complete me with scope vars</p>
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
              scope.isLocalOwner = function () {
                if (scope.doc.owner) {
                  return scope.doc.owner.originalId === undefined ||
                      scope.doc.owner.originalId === null;
                }
                else {
                  return false;
                }
              };

              scope.soUserLink = function () {
                return scope.doc.owner && scope.doc.owner.originalId ?
                    'http://stackoverflow.com/users/' +
                    scope.doc.owner.originalId :
                    null;
              };

              scope.formatDate = function (str) {
                if (str && str.length) {
                  var date = mlUtil.moment(str);
                  return date.format('MMM D, \'YY') +
                      ' at ' + date.format('h:mm');
                }
              };

              // Return human readable time since str date
              // http://momentjs.com/docs/#/displaying/fromnow/
              scope.formatDateRelative = function (str) {
                if (str && str.length) {
                  var date = mlUtil.moment(str);
                  return date.fromNow();
                }
              };

              // Return days between now and str date
              scope.daysSince = function (str) {
                if (str && str.length) {
                  var date = mlUtil.moment(str);
                  var now = mlUtil.moment();
                  // duration() not avail on mlUtil.moment objects (???)
                  //var days = mlUtil.moment.duration(date.diff(now), 'days');
                  var days = Math.floor(
                    (now.unix() - date.unix()) / (24 * 60 * 60)
                  );
                  return days;
                }
              };

              // tag click sets tags critieria to that tag, clears all else
              scope.goTag = function (tag) {
                appRouting.go(
                  'root.layout.explore.results',
                  {
                    'tags': tag,
                    'resolved': null,
                    'contributor': null,
                    'date-ge': null,
                    'date-lt': null
                  }
                );
              };

            }
          });

        }
      };
    }
  ]);
});
