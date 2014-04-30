// define(['app'], function(app) {
//   app.directive('mlssRating', function() {
//     return {
//       restrict: 'E',
//       scope: {
//         max: '=',
//         value: '=',
//         readOnly: '='
//       },
      /* jshint -W101 */ // disable line length rule
//       template: '<rating value="rate" max="max" readonly="isReadonly" on-hover="hoveringOver(value)" on-leave="overStar = null"></rating>'
      /* jshint +W101 */

//       link: function (scope, element, attrs, ngModelCtrl) {

//         scope.ratings = new Array(scope.max);

//         //hover logic
//         var hovered = -1;
//         scope.isHovered = function(idx) {
//           return idx <= hovered;
//         };
//         scope.hover = function(idx){
//           hovered = idx;
//         };
//         scope.nohover = function(idx){
//           hovered = -1;
//         };

//         //selection logic
//         scope.select = function(idx) {
//           return scope.rating = idx + 1;
//         };

//         scope.isSelected = function(idx) {
//           return scope.rating > idx;
//         };
//       }
//     };
//   });
// });
