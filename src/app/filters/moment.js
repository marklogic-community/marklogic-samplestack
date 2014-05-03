(function (undefined) {
// note: window.moment

  this.app.filter('fromDate', function () {
    return function (date) {
      if (!date) {
        return undefined;
      }
      else {
        return window.moment(date).toISOString();
      }
    };
  });

  this.app.filter('toDate', function () {
    return function (str) {
      if (!str) {
        return undefined;
      }
      else {
        return window.moment(str).toDate();
      }
    };
  });
}).call(global);
