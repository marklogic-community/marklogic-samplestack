* tests are .unit.js files (per component)
* Page (state) objects are .page.js files (per state)
* implication is that states have .unit (when they have a controller) and
.page (when they are not abstract)
* feature tests (.feature files) cross various components and states and are under the test directory,
not in the source code
