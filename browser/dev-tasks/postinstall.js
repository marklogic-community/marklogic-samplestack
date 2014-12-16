var selVer = '2.43.1';
var pconfig = require('protractor/config.json');

if (pconfig.webdriverVersions.selenium !== selVer) {
  console.log(
    'Configuring protractor to use Selenium Server version ' +
    selVer + ' for PhantomJS support...'
  );
  pconfig.webdriverVersions.selenium = selVer;
  require('fs').writeFileSync(
    'node_modules/protractor/config.json', JSON.stringify(pconfig)
  );
  console.log('...done.');
}
