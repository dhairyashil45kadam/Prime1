'use strict';

angular.module('financeUiApp')
  .controller('EditBulkTripCostController', ['$rootScope', '$scope', 'InvoiceService', 'UserProfileFactory', 'PermissionConstant',
    function($rootScope, $scope, InvoiceService, UserProfileFactory, PermissionConstant) {

      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      console.log($scope.globalData.tripsData);
       $scope.save = function() {
        console.log('nana');
       }


    }
  ]);
