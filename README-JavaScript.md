# Samplestack JavaScript-Based Development

> Understanding, Installing, running and developing the browser tier and Node.js middle-tier of marklogic-samplestack


## Understanding

When you use the JavaScript build of Samplestack, both the front-end and middle-tier server are written in JavaScript.

The Node.js/Express middle-tier REST server is of interest to those who wish to use JavaScript in each tier of their application.

For information about the front-end web application, please see the [browser README](./browser/README.md).

When the Samplestack application is launched using Gulp, it runs the Node.js middle-tier REST server **and** the web application, **both** on port 3000.

This README documents the installation/configuration of the Samplestack for developing JavaScript-based code in the browser and middle-tier. The commands discussed below run both tiers simultaneously.

This README focuses on the developer automation for JavaScript development that is delivered with Samplestack *in general*. The [browser README](./browser/README.md) discusses particulars of the browser-tier. *A Java developer may wish to work solely in the Java middle-tier code, allowing the browser to continue to function as delivered. This is possible because a static, pre-built copy of the browser code is included and run by the Java Spring server. Developer who wish to develop both Java middle-tier code and browser code may also do so. Please see [Browser Development with Java](./browser/README.md) for information.*

## Installing

### Prerequisites

To configure and develop the browser app for Samplestack, you need the following software:

* Node.js, version 0.10.x (it is mot yet compatible with Node.js 0.11 or 0.12). See [nodejs.org](http://nodejs.org).
* npm, version 2.1.1 or higher. See [npmjs.com](https://www.npmjs.com/)
* git. See [git-scm.com](http://git-scm.com/)

This "tech-stack" or minor variants thereof are almost ubiquitous in JavaScript development shops in 2015.

Before you begin, please ensure that the software above is installed and functional. It is a good idea to update node.js to the most recent version of 10.x if you have not installed a recent version.

In general, Windows, OSX and Linux should work.  

> ### Critical

> What will **NOT** work is Cygwin. In order to run the development version of the browser app on a Windows machine, you should have installed both node.js *and* git into your **Windows** environment and you should not use the Cygwin command shell to run any of the commands below.   Node, and particularly npm, do not expect the environment that Cygwin presents.  The commands will fail or work incorrectly if you run them from Cygwin or if you try to use versions of node, npm or git that were installed into your Cygwin sub-environment.

The following instructions should allow you:

* install prerequisites;
* install the webapp itself;
* build it and run its unit tests;
* visit the application in the browser;
* (re)run the unit tests in the browser;
* review the code-coverage report for the unit tests;
* execute and report on end-to-end tests of the 3-tiered application

### One-Time Setup

#### Global Utilities

There is one node.js components that you must have installed **globally** on your machine: [gulp](https://github.com/gulpjs/gulp).

Use npm, which should be installed with node.js, to install it:

```bash
(from-anywhere)> npm install -g gulp
```

##### Note on Elevated Privileges

**If you see errors** running either of the *install* commands above, you may
need escalated privileges. Many installations of node are configured such that installation of global components requires admin privileges.  If you receive permissions-based errors running these commands, please use elevated privileges to run them.  

*In \*nix-based operating systems* (including Mac OSX), this can be accomplished by prefixing the commands with `sudo`.

In Windows, one way to do this is to launch a `Command Prompt` with elevated privileges by right-clicking it from the Start Menu as selecting `"Run as Administrator"` and then executing the commands.

#### Installing JavaScript Dependencies

Before you run any gulp commands, please install the application dependences via npm.  Also repeat this step any time you pull down an updated version of Samplestack from Github, as the dependencies which these steps install may have changed.

We are installing various node.js utilities that are used in the build, and we are installing various browser libraries that are used by the webapp itself.  These command *should not* require elevated privileges. *Unless you **really know** why you're doing so*, **do not** use `sudo` or an elevated shell to execute them.

*From the marklogic-samplestack directory:*

```bash
marklogic-samplestack> npm install
```

**If you get this far without errors, your Samplestack browser installation is complete.**

If npm install gives you errors, see [npm install errors](#npm-install-errors) below.

On Mac OSX, if you get errors coming from the ~/.npm directory, please do the
following:

```
sudo chown -R $(whoami) ~/.npm
npm cache clean
mkdir ~/.npm
```
to seize ownership of that directory and clean the cache,
and then re-run `npm install`.

#### First-Time Setup of Samplestack and Initial Test

In order to configure Samplestack for JavaScript development, you must first run *setup* which configures the database. It will also execute one round of "end-to-end" tests to determine whether the environment is configured as expected.

Run this command from your local *Samplestack repository root directory*.

```bash
marklogic-samplestack>$ gulp once --browser=<browsername>
```

For *<browsername>*, you may supply one of "chrome", "firefox" or "ie". Please specify the name of a browser that you have already installed on your development machine,* for example `gulp once --browser=chrome`.

**Note: in version 1.1.0 of Samplestack, this command leverages the gradle/Java setup/automation code to configure the database.
You must have Java 1.7 or 1.8 installed for this to succeed.**

## Build, Unit Test, Run

A single command will build the webapp, execute its tests, generate online documentation and run a few web servers that enable you to run the application itself as well as examine some of the internals.

```bash
marklogic-samplestack/browser> gulp run
```

From here, you are presented with a menu that points to three web servers, in order they are:

* **BUILD server: http://localhost:3000**: This is the built application. Unlike the other services presented in the list. **Use the login credentials `joe@example.com`, password `joesPassword` to view and search content restricted to the Contributor role.**
* **UNIT TESTS: http://localhost:3001/unit-runner.html**: While the unit tests are executed *during* the build, they are not individually reported in the terminal if they succeed. This link allows you to re-run them in a web browser at any time, to see the individual test results, and even to expand each line item to see the code that comprsises each test.
* **COVERAGE: http://localhost:3002/coverage**: This is a report of the code coverage of unit tests.  You can drill down into each part of the webapp by clicking on the rows of the report. As you drill down into individual files, you will see line-by-line color coding that represents how/if a given line or branch of the code has been executed by the unit tests.  **This is also a very handy way to browse the code itself.**

*`gulp run` supports the `--middle-tier=external` flag for browser development with the __Java__ middle-tier. Please see [Browser Development with Java](./browser/README.md#Browser-Development-With-Java) for information.*

## "Live Coding" via Watch

The following command do everything that the `run` command does, but additionally enters "watch mode".  In watch mode, changes you make to the application, its tests, or its documentation are instantly incorporate into the build, unit tests are rerun and documentation regenerated.

*From the marklogic-samplestack directory:*

```bash
marklogic-samplestack/browser> gulp watch
```

In many cases, watch mode also causes a browser tab/window that is on app, the coverage report or the online documentation to be updated automatically via "Live Reload".  Not all browsers will support this.

MacOS users, please see the note below about your watched files limit. If you don't follow the instructions it presents, you may get errors when you enter watch mode.

*`gulp watch` supports the `--middle-tier=external` flag for browser development with the __Java__ middle-tier. Please see [Browser Development with Java](./browser/README.md#Browser-Development-With-Java) for information.*

## End-To-End Testing

End-to-end testing involves building the entire application (database, middle-tier and browser application), putting it in run-mode, and executing tests specifically designed to evaluate the functionality as a whole.

There are many moving parts to end-to-end testing of a three-tiered application. If any one of them, including the test environment(s) themselves isn't working perfectly, it will be apparent from the end-to-end testing (subject, of course, to specific tests being written to test features).

Such tests are set up by automating the process of getting things running, then (again, automatically) launching a browser (or browsers) and "pretending" to be
a human being using the application.

Selenium a server that is used to drive browsers, and web driver is a protocol that is used by Selenium to do that. End-to-end tests make requests to selenium in order to execute specific operations in the browser and to find out what is displayed at any given time.

"OpenSauce" is a service that is made available for free by SauceLabs for open source software testing using *their* farm of machines with browsers and selenium instances, accessible in the cloud.

Samplestack is configured to either run Selenium locally or to access SauceLabs.

`gulp e2e` is the command that is used to execute end-to-end tests.  There are several flags which control how the tests are executed.

* `--browser=[ie | ff | chrome | phantomjs]`: e.g. `browser=ie`. Used to specify a browser to launch **locally** along with an automatically launched local Selenium server. You must have Java installed to run Selenium. The default value is `chrome`.
* `--sauce[={platorm-key} | =all | =supported(s)]`: specifies a specifc platform or set of platforms on which to execute tests remotely using SauceLabs. To run these tests, you must supply credentials. See `shared/credentials.js` for information on configuring Sauce credentials. The list of browser/operating system combinations that will be run if you specify "all" or "supported" is listed in `share/js/options.js`. Any of the browsers configured to be runnable in that file may also be specified individually by key, e.g. `--sauce=win7-ie-10`. If both the `--browser` and `--sauce` flags are set, the task will fail. If `--sauce` is specified with no platform, then it is equivalent to `--sauce=supported`.
* `--middle-tier=[java | external]`. If `java` is specified, then the middle tier automation code will be controlled by the task, such that a clean install of the Java middle-tier and database configuration will be performed and the middle tier will be started.  On the contrary, if `external` is specified, then the task will assume that a middle tier server and database have already been configured and launched and are listening on port 8090. The default is for this flag to be unset (the e2e tests to use the Node.js middle-tier). *Please see [Browser Development with Java](./browser/README.md#Browser-Development-With-Java) for information.*
* `--tags="<comma-separated-tags>"`. Each tags is of the form `@tagname`. These are
tags present in the feature files. If specified, only features/scenarios which match this
specification will be executed. To specify NOT to match a tag, prefix with `~`. See example below regarding running tests that are known to be broken. *Full documentation of the syntax for the `--tags` flag is available by entering the command `node_modules/cucumber/bin/cucumber.js --help` from the Samplestack repository root directory.*

A few examples:

```bash
gulp e2e # or gulp e2e --browser=chrome
```

Runs the tests against locally installed Chrome with automatically configured local Selenium server, assuming the middle-tier has been launched in a separate process, and prints the results to the console.

Please note: if you either do not specify the middle-tier flag pr specify `external`, you are responsible for having a Java middle-tier running and ready. You are also responsible for ensuring that
your MarkLogic server has a clean/up-to-date Samplestack configuration and seed data. In other words, you should probably run the middle-tier teardown process if you're not sure of the state of your dataset/configuration.

```bash
gulp e2e --middle-tier=java --sauce --tags="@broken"
```

This is will specifically (and only) run scenarios which are tagged as *broken*, whereas without this flag they are skipped. the command that used by MarkLogic's nigthly regression system. It also **configures the MarkLogic server via the Java automation code, and launches the Java middle tier**, then executes the test suite against the list of supported browsers. It does not yet write to files and thus is not consumable by the test harness.

**Note: to use SauceLabs tests, please add a hosts file entry (or other domain resolution) that points "samplestack.local" to 127.0.0.1 on your machine.**
The reasons for this are documented in https://support.saucelabs.com/entries/27401240-Testing-with-a-localhost-server-and-some-browsers-can-t-load-my-website .

## Node.js/npm Tips and Troubleshooting

Please see [Node.js and npm Tips for Samplestack Development](https://github.com/marklogic/marklogic-samplestack/wiki/Node.js-and-npm-Tips-for-Samplestack-Development).

## OSX Workaround for Improperly Installed `phantomjs` Module

In some cases, the following may be seen when unit tests are run in the terminal:

```
...
[18:14:41] Starting 'unit'...

Unit Tests:
/path/to/marklogic-samplestack/node_modules/phantomjs/lib/location.js:1
(function (exports, require, module, __filename, __dirname) {
^
TypeError: Bad argument
at ChildProcess.spawn (child_process.js:936:24)
at exports.spawn (child_process.js:736:9)
...
[18:14:43] Error in plugin 'gulp-mocha-phantomjs'
test failed
```

This error occurs if the `phantomjs` library did not install properly. To work around this, the developer may manually install `phantomjs` (from the marklogic-samplestack repostiory root directory):

```
> $ npm install phantomjs
```

## OSX Workaround for Watch Mode

In general your "watch" process will be faster on Mac/OSX computers if you raise the limit of the number
of open files for your process.  

Additionally, there may be machines that report errors in `watch` mode saying that the maximum number of open files has been reached.

To set the maxfiles limit for your system, make or modify the file at `~/.launchd.conf` to have a line
reading:

```
limit maxfiles 16384 unlimited
```

and then log out of your OSX session and log back in (or just restart your
machine).

## License

Copyright © 2012-2015 MarkLogic

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
