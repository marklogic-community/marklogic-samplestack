(function (undefined) {
  this.app.filter('fromPoint', function () {
    return function (point) {
      if (!point) {
        return null;
      }
      else {
        return '[' + point[0] + ',' + point[1] + ']';
      }
    };
  });

  this.app.filter('toPoint', function () {
    // octal not supported
    var parseNum = function (str) {
      if (str.indexOf('.') > -1) {
        return parseFloat(str);
      }
      else {
        return parseInt(str);
      }

    };

    return function (str) {
      if (!str) {
        return null;
      }
      else {
        // [3.2, 6 ] or (  0x3f,-1)
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
}).call(global);
