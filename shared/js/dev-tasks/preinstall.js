var version = function () {
  var matched = process.version.match(/^v\d+\.(\d+)\.(\d+)$/);
  return {
    minor: parseInt(matched[1]),
    revision: parseInt(matched[2])
  };
};

var v = version();

if (v.minor !== 10 || v.revision < 20) {
  process.stderr.write(
    'Unsupported Node.js version (' + process.version + ').\n\n' +
        'Please install a recent release of Node.js 0.10.x ()'
  );
  process.exit(1);
}
