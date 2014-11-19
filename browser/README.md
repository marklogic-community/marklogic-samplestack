# Samplestack Web Application

> Understanding, Installing, running and developing the browser tier of marklogic-samplestack

## Understanding

The Samplestack web application is built with AngularJS. It is built to run from a static web server and to access the Samplestack middle-tier via AJAX.

In development, the two servers are proxied together on port 3000 in order to make some of the browser development activities work, and to simplify the networking when running locally.

To *use the webapp in a browser*, you should be [running the middle-tier tier app](../appserver/java-spring/README.md) (and the MarkLogic server).

Conversely, *to unit test the webapp*, you need not be running the middle tier -- the middle tier will neither help nor hurt the the webapp unit tests as they are independent of the middle tier.


## Installing

Before you begin, please ensure that [node.js](http://nodejs.org/) and [git](http://git-scm.com/) are installed. It is a good idea to update node.js if you have not installed a recent version, but it is believed that any 0.10 or 0.11 version will work.

*Important: you should run all of the commands discussed in this page __in a different terminal window__ from the Java middle-tier.  This allows you to have the middle-tier running simultaneously with the the browser tier.*

In general, Windows, OSX and Linux should work.  

> ### Critical

> What will **NOT** work is Cygwin. In order to run the development version of the browser app on a Windows machine, you should have installed both node.js *and* git into your **Windows** environment and you should not use the Cygwin command shell to run any of the commands below.   Node, and particularlly npm, do not expect the enviornment that Cygwin presents.  The commands will fail if you run them from Cygwin or if you try to use versions of node, npm or git that were installed into your Cygwin sub-environment.

The following instructions should allow you:

* install prerequisites;
* install the webapp itself;
* build it and run its unit tests;
* visit the application in the browser;
* (re)run the unit tests in the browser;
* review the code-coverage report for the unit tests.

### One-Time Prerequisites Setup

#### Global Utilities

There are two node.js components that you must have installed **globally** on your machine: [bower](http://bower.io/) and [gulp](https://github.com/gulpjs/gulp)

Use npm, which should be installed with node.js, to install them:

```bash
(from-anywhere)> npm install -g bower
(from-anywhere)> npm install -g gulp
```

##### Note on Elevated Privileges

**If you see errors** running either of the *install* commands above, you may
need escalated privileges. Many installations of node are configured such that installation of global components requires admin privileges.  If you receive permissions-based errors running these commands, please use elevated privileges to run them.  

*In \*nix-based operating systems* (including Mac OSX), this can be accomplished by prefixing the commands with `sudo`.

In Windows, one way to do this is to launch a `Command Prompt` with elevated privileges by right-clicking it from the Start Menu as selecting `"Run as Administrator"` and then executing the commands.

### Installing the Webapp

The first time you want to run the webapp, please follow these directions.  Also repea them any time you pull down an updated version of Samplestack from Github, as the dependencies which these steps install may have changed.

We are installing various node.js utilities that are used in the build, and we are installing various browser libraries that are used by the webapp itself.  These command *should not* require elevated privileges. *Unless you **really know** why you're doing so*, **do not** use `sudo` or an elevated shell to execute them.

*From the marklogic-samplestack directory:*

```bash
marklogic-samplestack> cd browser
marklogic-samplestack/browser> npm install
marklogic-samplestack/browser> bower install
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

## Build, Unit Test, Run

A single command will build the webapp, execute its tests, generate online documentation and run a few web servers that enable you to run the application itself as well as examine some of the internals.

```bash
marklogic-samplestack/browser> gulp run
```

From here, you are presented with a menu that points to three web servers, in order they are:

* **BUILD server: http://localhost:3000**: This is the built application. Unlike the other services presented in the list, this one, the app itself, depends on the middle-tier application to be fully functional. See the [main Samplestack README](../README.md) for notes on using the application.
* **UNIT TESTS: http://localhost:3001/unit-runner.html**: While the unit tests are executed *during* the build, they are not individually reported. This link allows you to re-run them in a web browser at any time, to see the individual test results, and even to expand each line item to see the code that comprsises each test.
* **COVERAGE: http://localhost:3002/coverage**: This is a report of the code coverage of unit tests.  You can drill down into each part of the webapp by clicking on the rows of the report. As you drill down into individual files, you will see line-by-line color coding that represents how/if a given line or branch of the code has been executed by the unit tests.  **This is also a very handy way to browse the code itself.**

Once you have the webapp running, please see the instructions in the [main README](../README.md) for login credentials and other end-user usage notes.

## "Live Coding" via Watch

The following command do everything that the `run` command does, but additionally enters "watch mode".  In watch mode, changes you make to the application, its tests, or its documentation are instantly incorporate into the build, unit tests are rerun and documentation regenerated.

*From the marklogic-samplestack/**browser** sub-directory:*

```bash
marklogic-samplestack/browser> gulp watch
```

In many cases, watch mode also causes a browser tab/window that is on app, the coverage report or the online documentation to be updated automatically via "Live Reload".  Not all browsers will support this.

MacOS users, please see the note below about your watched files limit. If you don't follow the instructions it presents, you may get errors when you enter watch mode.

## npm install Errors

If `npm install` has errors, the first thing to try is to simply re-run it. There are known issues with npm which may require one re-run. If the second run also fails, you may have a version of npm which was not reliable.  Try updating npm before rerunning the above install commands.

> ```
> from-anywhere> npm update -g npm
> ```

## Temporary OSX Workaround for Watch Mode

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
