'use strict';

angular.module('financeUiApp')
  .factory('HttpQService', ['$q', '$http', 'APP_CONST', function($q, $http, APP_CONST) {
    return {
      get: function(path, data) {
        var deferred = $q.defer(),
          url = APP_CONST.ApiUrl + path;

        $http({
          method: 'GET',
          url: url,
          params: data
        }).success(function(data) {
          deferred.resolve(data);
        }).error(function(data) {
          deferred.reject(data);
        });

        return deferred.promise;
      },
      post: function(path, data) {
        var deferred = $q.defer(),
          url = APP_CONST.ApiUrl + path;

        $http.post(url, JSON.stringify(data)).success(function(data) {
          deferred.resolve(data);
        }).error(function(data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },

      put: function(path, data) {
        data = data || {};
        var deferred = $q.defer(),
          url = APP_CONST.ApiUrl + path;
        $http.put(url, JSON.stringify(data)).success(function(data) {
          deferred.resolve(data);
        }).error(function(data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },

      delete: function(path) {
        var deferred = $q.defer(),
          url = APP_CONST.ApiUrl + path;
        $http.delete(url).success(function(data) {
          deferred.resolve(data);
        }).error(function(data) {
          deferred.reject(data);
        });
        return deferred.promise;
      },
      postMeta: function(path, data) {
        var deferred = $q.defer(),
          url = APP_CONST.ApiUrl + path;

        $http.post(url, data, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function(data) {
          deferred.resolve(data);
        }).error(function(data) {
          deferred.reject(data);
        });
        return deferred.promise;
      }
    };
  }]);
