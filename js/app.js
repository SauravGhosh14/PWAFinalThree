// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

angular.module('starter', ['ionic','starter.controllers','chart.js'])

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
    templateUrl: 'templates/app.html'
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
    
//    .state('home', {
//    url: '/home',
//    abstract: true,
//    templateUrl: 'templates/headerB.html',
//    controller: 'headerBCtrl'
//    })
//    
//    .state('home.home', {
//      url: '/home',
//      views: {
//        'home': {
//          templateUrl: 'templates/home.html',
//          controller: 'homeCtrl'
//        }
//      }
//    })
//    
//    .state('home.plans', {
//      url: '/plans',
//      views: {
//        'home': {
//          templateUrl: 'templates/plans.html',
//          controller: 'homeCtrl'
//        }
//      }
//    })
//    
//      .state('home.pdq', {
//      url: '/pdq',
//      views: {
//        'home': {
//          templateUrl: 'templates/pdq.html',
//          controller: 'homeCtrl'
//        }
//      }
//    })
    
      .state('app.passwordResetFromApp', {
      url: '/passwordResetFromApp',
      views: {
        'home': {
          templateUrl: 'templates/passwordResetFromApp.html',
          controller: 'passwordResetFromAppCtrl'
        }
      }
    }) 
    
      // setup an abstract state for the tabs directive
    .state('tabs', {
    url: '/tabs',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'tabsCtrl'
  })
    
    // Each tab has its own nav history stack:

  .state('tabs.home', {
    cache: false,
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'homeCtrl'
      }
    }
  })

  .state('tabs.plans', {
      cache: false,
      url: '/plans',
      cache: false,
      views: {
        'tab-plans': {
          templateUrl: 'templates/tab-plans.html',
          controller: 'plansCtrl'
        }
      }
    })
    
  .state('tabs.plansExerciseHome', {
      cache: false,
      url: '/plans/exercise/home',
      views: {
        'tab-plans': {
          templateUrl: 'templates/tab-plans-exercise-home.html',
          controller: 'plansExerciseHomeCtrl'
        }
      }
    })

    .state('tabs.plansExerciseNew', {
      cache: false,
      url: '/plans/exercise/new',
      views: {
        'tab-plans': {
          templateUrl: 'templates/tab-plans-exercise-new.html',
          controller: 'plansExerciseNewCtrl'
        }
      }
    })
    
    .state('tabs.plansExerciseNewNotes', {
      cache: false,         
      url: '/plans/exercise/new/notes',
      views: {
        'tab-plans': {
          templateUrl: 'templates/tab-plans-exercise-new-notes.html',
          controller: 'plansExerciseNewCtrl'
        }
      }
    })
    
    .state('tabs.plansExerciseNewCustom', {
      cache: false,
      url: '/plans/exercise/new/custom',
      views: {
        'tab-plans': {
          templateUrl: 'templates/tab-plans-exercise-new-custom.html',
          controller: 'plansExerciseNewCtrlCustom'
        }
      }
    })
    
    .state('tabs.plansExerciseNewNotesCustom', {
      cache: false,         
      url: '/plans/exercise/new/notes/custom',
      views: {
        'tab-plans': {
          templateUrl: 'templates/tab-plans-exercise-new-notes-custom.html',
          controller: 'plansExerciseNewCtrlCustom'
        }
      }
    })    

    .state('tabs.plansHelp', {
    url: '/plans/help',
    views: {
      'tab-plans': {
        templateUrl: 'templates/tab-plans-help.html'
      }
    }
  })
    
  .state('tabs.pdq', {
    cache: false,
    url: '/pdq',
    views: {
      'tab-pdq': {
        templateUrl: 'templates/tab-pdq.html',
        controller: 'pdqCtrl'
      }
    }
  }) 
    
    .state('tabs.cueList', {
    cache: false,     
    url: '/pdq/cueList',
    views: {
      'tab-pdq': {
        templateUrl: 'templates/tab-pdq-cueList.html',
        controller: 'cueList'
      }
    }
  })

    .state('tabs.cueListTwo', {
    cache: false,
    url: '/pdq/cueListTwo',
    views: {
      'tab-pdq': {
        templateUrl: 'templates/tab-pdq-cueList-two.html',
        controller: 'cueList'
      }
    }
  })    
    
    .state('tabs.newSession', {
    cache: false,  
    url: '/pdq/newSession',
    views: {
      'tab-pdq': {
        templateUrl: 'templates/tab-pdq-newSession.html',
        controller: 'newSession'
      }
    }
  })    
    
    .state('tabs.pdqHelp', {
    url: '/pdq/help',
    views: {
      'tab-pdq': {
        templateUrl: 'templates/tab-pdq-help.html',
        controller: 'pdqCtrl'
      }
    }
  })    
    
    ;

    
  // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/welcome');
    $ionicConfigProvider.tabs.position('bottom'); // other values: top      

});


