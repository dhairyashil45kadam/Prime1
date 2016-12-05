'use strict';

angular.module('financeUiApp')
    .factory('UserProfileFactory', ['$rootScope', '$q', '$http', '$cookies', '$location', 'APP_CONST',
        function($rootScope, $q, $http, $cookies, $location, APP_CONST) {
            var userProfile = {};

            var fetchUserProfile = function() {
                var deferred = $q.defer();
                var loginUrl = APP_CONST.loginServiceUrl + APP_CONST.loginPagePath + '?client_id=' + APP_CONST.client;

                $rootScope.isTokenUndefined = function() {
                    return typeof($rootScope.accessToken) === 'undefined';
                };

                $rootScope.getToken = function() {
                    $rootScope.accessToken = $cookies.get('access_token');
                    if ($rootScope.isTokenUndefined()) {
                        window.location.href = loginUrl;
                    } else {
                        $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.accessToken;
                    }
                };
                $rootScope.getToken();

                $rootScope.logout = function() {
                    $http({
                        method: 'GET',
                        url: APP_CONST.loginServiceUrl + APP_CONST.tokenRemovePath
                    }).then(function successCallback(response) {
                        window.location.href = loginUrl;
                        console.log(response);
                    }, function errorCallback(response) {
                        console.log(response);
                        window.location.href = loginUrl;
                    });

                    $cookies.remove('access_token', {
                        domain: APP_CONST.tokenDomain
                    });

                };


                $http({
                    method: 'POST',
                    url: APP_CONST.ApiUrl + APP_CONST.userProfile,
                    data: {
                        token: $rootScope.accessToken
                    },
                    headers: {
                        'Authorization': 'Bearer ' + $rootScope.accessToken
                    }
                }).then(function successCallback(response) {
                    console.log(response.data);
                    // $rootScope.userProfile = response.data;

                    for (var prop in userProfile) {
                        if (userProfile.hasOwnProperty(prop)) {
                            delete userProfile[prop];
                        }
                    }

                    deferred.resolve(angular.extend(userProfile, response.data, {
                        $refresh: fetchUserProfile,

                        $hasRole: function(role) {
                            return userProfile.authorities.indexOf(role) >= 0;
                        },

                        $hasAnyRole: function(roles) {
                            return !!userProfile.authorities.filter(function(role) {
                                return roles.indexOf(role) >= 0;
                            }).length;
                        },

                        $isAnonymous: function() {
                            return !userProfile.authenticated;
                        },

                        $isAuthenticated: function() {
                            return userProfile.authenticated;
                        }
                    }));
                }, function errorCallback(response) {
                    console.log(response);
                    $rootScope.logout();
                });

                return deferred.promise;
            };

            return fetchUserProfile();
        }
    ]);
