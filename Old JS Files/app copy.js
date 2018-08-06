// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

angular.module('starter', ['ionic','starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider ) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/headerA.html'
    })
    
    .state('app.welcome', {
    url: '/welcome',
      views: {
        'home': {
          templateUrl: 'templates/welcome.html',
          controller: 'welcomeCtrl'
        }
      }
    })
    
    .state('app.login', {
      url: '/login',
      views: {
        'home': {
          templateUrl: 'templates/login.html',
          controller: 'loginCtrl'
        }
      }
    })
    
    .state('app.forgotPassword', {
      url: '/login/:email',
      views: {
        'home': {
          templateUrl: 'templates/forgotPassword.html',
          controller: 'forgotPasswordCtrl'
        }
      }
    })  
    
    .state('app.homeIA', {
      url: '/homeIA/:user',
      views: {
        'home': {
          templateUrl: 'templates/homeIA.html',
          controller: 'homeIACtrl'
        }
      },
      params: {user: null}
    })
    
    .state('app.passwordReset', {
      url: '/passwordReset',
      views: {
        'home': {
          templateUrl: 'templates/passwordReset.html',
          controller: 'passwordResetCtrl'
        }
      }
    })  

    .state('home.passwordReset', {
      url: '/passwordResetFromApp/:user',
      views: {
        'home': {
          templateUrl: 'templates/passwordResetFromApp.html',
          controller: 'passwordResetFromAppCtrl'
        }
      }
    })
    
    .state('home', {
    url: '/home',
    abstract: true,
    templateUrl: 'templates/headerB.html',
    controller: 'headerBCtrl'
    })
    
    .state('home.home', {
      url: '/home/:user',
      views: {
        'home': {
          templateUrl: 'templates/home.html',
          controller: 'homeCtrl'
        }
      },
      params: {user: null}
    })
    
    .state('home.plans', {
      url: '/plans/:user',
      views: {
        'home': {
          templateUrl: 'templates/plans.html',
          controller: 'homeCtrl'
        }
      }
    })
    
      .state('home.pdq', {
      url: '/pdq/:user',
      views: {
        'home': {
          templateUrl: 'templates/pdq.html',
          controller: 'homeCtrl'
        }
      }
    })
    
    
    
    
    
    
    
    
    ;

    
  // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/welcome');
    $ionicConfigProvider.tabs.position('bottom'); // other values: top      

});


