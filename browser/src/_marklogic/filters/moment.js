define(['_marklogic/module', 'moment'], function (module, moment) {
  module.filter('fromDate', function () {
    return function (date) {
      if (!date) {
        return undefined;
      }
      else {
        return moment(date).toISOString();
      }
    };
  });

  module.filter('toDate', function () {
    return function (str) {
      if (!str) {
        return undefined;
      }
      else {
        return moment(str).toDate();
      }
    };
  });

});
