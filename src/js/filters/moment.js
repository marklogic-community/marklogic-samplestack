define(['app', 'moment'], function(app, moment) {
  app.filter('fromDate', function() {
    return function(date) {
      if (!date) {
        return undefined;
      }
      else {
        return moment(date).toISOString();
      }
    };
  });

  app.filter('toDate', function() {
    return function(str) {
      if (!str) {
        return undefined;
      }
      else {
        return moment(str).toDate();
      }
    };
  });
});
