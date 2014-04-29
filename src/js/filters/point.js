define(['app'], function(app) {
  app.filter('fromPoint', function() {
    return function(point) {
      if (!point) {
        return null;
      }
      else {
        return '[' + point[0] + ',' + point[1] + ']';
      }
    };
  });

  var parseNum = function(str) {
    if (str.indexOf('.') > -1) {
      return parseFloat(str);
    }
    else {
      return parseInt(str);
    }

  };
  app.filter('toPoint', function() {
    return function(str) {
      if (!str) {
        return null;
      }
      else {
        var ptParser =
            /^\s*[\(\[]\s*([^\,\s]*\s*)\s*,\s*([^\) ]*\s*)\s*[\)|\]]\s*$/;

        try {
          var res = ptParser.exec(str);
          if (res) {
            return [parseNum(res[1]), parseNum(res[2])];
          }
        } catch (err) {}
        return null;
      }
    };
  });
});
