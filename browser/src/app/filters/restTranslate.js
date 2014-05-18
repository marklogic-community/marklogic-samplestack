(function (undefined) {
  this.app.filter('fromServer', [

    'toDateFilter',
    function (toDateFilter) {
      return function (serverStyle) {
        if (!serverStyle) {
          return null;
        }
        else {
          return {
            id: serverStyle.id,
            body: serverStyle.point,
            date: toDateFilter(serverStyle.startDate),
            title: serverStyle.name,
            rating: serverStyle.doubleValue
          };
        }
      };
    }
  ]);

  this.app.filter('toServer', [

    'fromDateFilter',
    function (fromDateFilter) {
      return function (ourStyle) {
        if (!ourStyle) {
          return null;
        }
        else {
          return {
            id: ourStyle.id,
            point: ourStyle.body,
            startDate: fromDateFilter(ourStyle.date),
            name: ourStyle.title,
            doubleValue: ourStyle.rating
          };
        }
      };
    }

  ]);
}).call(global);
