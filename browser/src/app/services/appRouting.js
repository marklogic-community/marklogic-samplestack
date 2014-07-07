/*
app/appRouting.js
 */

define(['app/module'], function (module) {

  var setHtmlFiveOrHash = function ($provide, settings, $locationProvider) {
    $provide.decorator('$sniffer', function ($delegate) {
      // set history to false if you want to run hashode (perhaps your
      // webserver isn't configured for url rewriting in support of html5,
      // or you want hash signs in your urls for some other reason)
      // See buildParams to change this, see /gulp/tasks (search for
      // "modrewrite" to see an html5 push-mode
      // supporting configuration).

      if (settings.html5Mode === false) {
        // if we set history to falls, we're telling angular the browser
        // does not support html5 mode, which will cause it to adjust
        // (on the fly all of our URLs to use hash marks.  effectively
        // this disables html5 mode without invalidating all of the URLs
        // that are used throughout the application code (e.g for
        // state url assignments)
        $delegate.history = false;

      }

      return $delegate;
    });
    // don't be fooled -- html5 mode is controlled above based on settings
    // we do it this way so we can author all URLs in the app in a manner
    // that lets us choose at build time which mode to use, rather than
    // having to go back and change all of the URLs based on the decision
    // of html5mode or not.
    $locationProvider
      .html5Mode(true)
      .hashPrefix('');
  };

  // /**
  //  * Assign fullnames to states
  //  * @param {[type]} parentalPrefix [description]
  //  * @param {[type]} state          [description]
  //  */
  // var setFullNames = function (parentalPrefix, state) {
  //
  // };

  var setStateDefaults = function (parentPrefix, state) {
    state.fullName = parentPrefix + state.name;
    if (_.isUndefined(state.views)) {
      setViewDefaults(state);
    }
    else {
      _.forEach(state.views, function (view, name) {
        view.fullName = name.indexOf('@') >= 0 ?
            name :
            name + '@' + state.fullName;

        // view.fullName = view.fullName
        //     .replace(/^root\./, '')
        //     .replace(/@root/, '@')
        //     .replace(/^layout\./, '')
        //     .replace(/@\.layout/, '@')
        //     .replace(/@\./, '@')
        //     .replace(/@$/, '');

        setViewDefaults(view);
      });
    }
    _.forEach(state.children, function (child) {
      setStateDefaults(state.fullName + '.', child);
    });

  };

  /**
   * Defaults a filename for a view's template if it is undefined (as opposed to
   * null).
   * Defaults a controller for a view if it is undefined (as opposed to null).
   *
   * Assumes that a view has already had its fullname inferred.
   * @param {Object} view A state or view.
   */
  var setViewDefaults = function (view) {
    // make a short name so filenames don't have root and layout all over
    // the place
    var shortName = view.fullName
        .replace(/^root\./, '') //remove root. prefix
        .replace(/^layout\./, '') //remove remaining layout. prefix
        .replace(/@root$/, '@') //remove @root suffix
        .replace(/@\.layout/, '@') //remove @.layout suffix
        .replace(/@\./, '@') //remove @. suffix
        .replace(new RegExp('@' + view.name), '@') //remove @viewname suffix
        .replace(/@$/, ''); //remove trailing @

    if (!shortName.length) {
      // if there is nothing left of the shortname, use the fullname absent
      // the @ sign
      shortName = view.fullName.replace(/@/, '');
    }

    if (_.isUndefined(view.templateUrl)) {
      // templateurl needs dashes and $ signs for legality/clarity
      view.templateUrl = '/app/states/' + shortName
          .replace(/@/g, '$')
          .replace(/\./g, '-');
      view.templateUrl += '.html';
    }
    if (_.isUndefined(view.controller)) {
      // controller name is simplified -- if these rules aren't specific
      // enough, then name the controller manually
      view.controller = shortName
          .replace(/-/g, '')
          .replace(/@/g, '');
      view.controller += 'Ctlr';
    }
  };

  var attachEvents = function ($rootScope) {
    // TODO: handle these more gracefully!
    // this should be the role of the stateManager
    $rootScope.$on('$stateNotFound',
        function (event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );
    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );
    $rootScope.$on('$stateChangeError',
        function (event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );
    $rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams, error) {
          // console.log(toState);
        }
    );

    // $state.go('home');

  };

  module.provider('appRouting', [

    'statesHierarchy',
    'stateHelperProvider',
    'appSettings',
    '$provide',
    '$locationProvider',
    '$urlRouterProvider',
    function (
      statesHierarchy,
      stateHelperProvider,
      appSettings,
      $provide,
      $locationProvider,
      $urlRouterProvider
    ) {

      // define the state defs tree -- secon param
      // says that we've alrady prepared the names of
      // the states so don't use dot notation on them
      // to construct the names internally.
      // this is done to avoid having to refer to states
      // which are always abstract in state names

      this.configure = function (hierarchy) {
        setStateDefaults('', hierarchy);
        stateHelperProvider.setNestedState(hierarchy);
      };

      $urlRouterProvider.otherwise('/404');

      setHtmlFiveOrHash($provide, appSettings, $locationProvider);

      // TODO -- lots of stuff to be done here
      this.$get = [
        '$rootScope', '$state',
        function ($rootScope, $state) {
          attachEvents($rootScope);
          return {

            // TODO: all of the runtime functionality of the aooRouting service

            go: function (toStateShort) {
              $state.go('root.layout.' + toStateShort);
            }

          };
        }
      ];

    }
  ]);
});
