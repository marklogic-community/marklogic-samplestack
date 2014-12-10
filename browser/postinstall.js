var pconfig = require('protractor/config.json');

pconfig.webdriverVersions.selenium = '2.43.1';

require('fs').writeFile(
  'node_modules/protractor/config.json', JSON.stringify(pconfig)
);
