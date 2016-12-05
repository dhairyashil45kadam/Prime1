'use strict';

/**
 * @ngdoc overview
 * @name financeUiApp
 * @description
 * # financeUiApp
 *
 * Main module of the application.
 */
angular
  .module('financeUiApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ui.router',
    'ngCsvImport',
    'ngSanitize',
    'ngTouch',
    'ngDialog',
    'datePicker',
    'angular-carousel',
    'ui.sortable',
    'isteven-multi-select'

  ], function($httpProvider) {

    /**
     * The workhorse converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */
    var param = function(obj) {
      var query = '',
        name, value, fullSubName, subName, subValue, innerObj, i;

      for (name in obj) {
        value = obj[name];

        if (value instanceof Array) {
          for (i = 0; i < value.length; ++i) {
            subValue = value[i];
            fullSubName = name + '[' + i + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += param(innerObj) + '&';
          }
        } else if (value instanceof Object) {
          for (subName in value) {
            subValue = value[subName];
            fullSubName = name + '[' + subName + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += param(innerObj) + '&';
          }
        } else if (value !== undefined && value !== null) {
          query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
      }

      return query.length ? query.substr(0, query.length - 1) : query;
    };


    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [
      function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
      }
    ];
  })
  .config(function($urlRouterProvider, $stateProvider, $httpProvider) {

    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.defaults.headers.post = {
      "Content-Type": "application/json"
    };

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.home', {
        url: 'home',
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.documents', {
        url: 'documents',
        templateUrl: 'views/documents.html',
        controller: 'DocumentsCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.invoice', {
        url: 'trips',
        templateUrl: 'views/invoice.html',
        controller: 'InvoiceCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.clientHistory', {
        url: 'clientHistory',
        templateUrl: 'views/client.html',
        controller: 'ClientCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.clients', {
       url: 'clients',
       templateUrl: 'views/allClients.html',
       controller: 'AllClientsCtrl',
       resolve: {
         Access: ['AccessFactory',function(AccessFactory){
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
     })
      .state('main.routes', {
        url: 'routes',
        templateUrl: 'views/routes.html',
        controller: 'RoutesCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.user', {
        url: 'user',
        templateUrl: 'views/user.html',
        controller: 'UserCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.missingTrips', {
        url: 'missingTrips',
        templateUrl: 'views/missingTrips.html',
        controller: 'MissingTripsCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.tripDetails', {
        url: 'tripDetails',
        templateUrl: 'views/tripDetails.html',
        controller: 'TripDetailsCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.businessVertical', {
        url: 'businessVertical',
        templateUrl: 'views/businessVertical.html',
        controller: 'BusinessVerticalCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.payment', {
        url: 'payments',
        templateUrl: 'views/payment.html',
        controller: 'PaymentCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.generatedInvoices', {
        url: 'invoices',
        templateUrl: 'views/generatedInvoices.html',
        controller: 'GeneratedInvoiceCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.invoicingMis', {
        url: 'invoicingMis',
        templateUrl: 'views/invoicingMis.html',
        controller: 'InvoicingMisCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.tripWiseBilling', {
        url: 'tripWiseBilling',
        templateUrl: 'views/tripWiseBilling.html',
        controller: 'TripWiseBillingCtrl',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      })
      .state('main.routeRateMis', {
        url: 'routeRateMis',
        templateUrl: 'views/routeRateMis.html',
        controller: 'RouteRateMis',
        resolve: {
         Access: ['AccessFactory', function(AccessFactory) {
           return AccessFactory.isAuthenticated();
         }],
         UserProfile: 'UserProfileFactory'
       }
      });
    $urlRouterProvider.otherwise('home');
    $httpProvider.interceptors.push(function($q, APP_CONST, $rootScope) {
            return {
                response: function(response) {
                    return response;
                },
                responseError: function(response) {
                    if (response.status === 401 || response.status === 403) {
                        $rootScope.logout();
                        return $q.reject(response);
                    } else {
                        return $q.reject(response);
                    }
                }
            };
        });
    }).run(function($rootScope, $location, AccessFactory) {
        $rootScope.$on("$stateChangeError", function(event, current, previous, rejection) {
            if (rejection === AccessFactory.UNAUTHORIZED) {
                console.log('UNAUTH');
                $rootScope.logout();
            } else if (rejection === AccessFactory.FORBIDDEN) {
                console.log('FORB');
                $rootScope.logout();
            }
        });
  // })
  // .run(function($rootScope, $location, $state) {
  //   $rootScope.$on('$stateChangeStart', function(ev, to, toParams, from, fromParams) {
  //     // if (!sessionStorage.userLogin) {
  //     //   $location.path('/login');
  //     //   $state.go('login');
  //     // }
  //   });
  //   $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
  //     // if (to.sideNav) {
  //     //   $rootScope.sideNav = to.sideNav;
  //     // }
  //   });
  });
