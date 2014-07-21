# marklogic-samplestack-angular

---

> An AngularJS webapp that represents the web tier of basic 3-tiered
MarkLogic-based development,
following the MarkLogic Reference Architecture

---

*Note: this repository is meant to be used in the context of a full
three-tiered stack such as the [Java stack](https://github.com/marklogic/samplestack-java)
or the [Node.js stack](https://github.com/marklogic/samplestack-node).*

## Important: Temporary OSX Workaround for Watch Mode

In general your "watch" process is faster if you raise the limit of the number
of open files for your process or the system.  However, in normal cases, there
is no harm (other than speed) to not raising the limit, because
[gaze](https://github.com/shama/gaze) implements a different strategy when
it reaches that limit.  However, at the present time two forces are combining
to make the `watch` task problematic:

1. OSX defaults to a very low limit
2. gaze has a bug that is causing it to fail when that limit is reached.

Thus, while generally it's just a good idea to raise the limit, for now it's
also mandatory on OSX.

To achive this, make or modify the file at `~/.launchd.conf` to have a line
reading:

```
limit maxfiles 16384 unlimited
```

and then log out of your OSX session and log back in (or just restart your
machine).

## Development Process

```
git pull        # update your local repo
npm install     # install npm packages
bower install   # install bower packages
gulp <command>  # run a gulp task
```

`command`s include:

* `build`:  do a clean build, including linting
* `unit`:   build, then run unit tests
* `run`:    unit, then run servers (details below)
* `watch`:  run, then watch for file changes and update tests and code live

*(watch-mode also automatically enables livereload in your browser)*

**In run and watch mode, you may use these URLs**:

<a target="_blank" href="https://localhost:3000">https://localhost:3000</a> -- view the running app.
Livereload is enabled by a script embedded in the app so changes should
be instantly seen in a browser.

<a target="_blank" href="https://localhost:3001/unit-runner.html">https://localhost:3001/unit-runner.html</a>
 -- run
unit tests within the browser.  Unit tests are run upon build and upon changes
during watch mode using PhantomJS and results are reported in the console.
It may also be useful to run the tests from within the browser to debug.

#### alternative `builds` directory docs -- todo: clean up

**`del` package is wiping out the readmen that was supposed to live in the
builds directory**

> Builds are placed in subdirectories here

* `build`: an unminified build. Eventually, this build will not be configured to hit a REST server, instead to use mocks.  Suitable for debugging the UI and evaluating its appearance.  By design, not to be used for evaluation of end-to-end functionality.  Typically accessible at [http://localhost:3000](http://localhost:3000)
* `unit-tester`: an uniminified build that is configured to execute unit tests, either through the command line or via the browser (via http://*&lt; domain:port &gt;*/unit-runner.html -- typically [http://localhost:3001/unit-runner.html](http://localhost:3001/unit-runner.html)).

## License

Copyright © 2014 MarkLogic

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
