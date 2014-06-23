#### `builds` directory

> Builds are placed in subdirectories here

* `main`: an unminified build. Eventually, this build will not be configured to hit a REST server, instead to use mocks.  Suitable for debugging the UI and evaluating its appearance.  By design, not to be used for evaluation of end-to-end functionality.  Typically accessible at [http://localhost:3000](http://localhost:3000)
* `unit-tester`: an uniminified build that is configured to execute unit tests, either through the command line or via the browser (via http://*&lt; domain:port &gt;*/unit-runner.html -- typically [http://localhost:3001/unit-runner.html](http://localhost:3001/unit-runner.html)).
