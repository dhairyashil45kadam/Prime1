'use strict';

angular.module('financeUiApp')
  .controller('EditBulkTripCostController', ['$rootScope', '$scope', 'InvoiceService', 'UserProfileFactory', 'PermissionConstant',
    function($rootScope, $scope, InvoiceService, UserProfileFactory, PermissionConstant) {

      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      $scope.rateComponents = [{
        label: "Base rate",
        key: "baseRate",
        isEditable: true
      }, {
        label: "Fuel surcharge",
        key: "fuelSurcharge",
        isEditable: true
      }, {
        label: "Loading Detention",
        key: "loadingDetention",
        isEditable: true
      }, {
        label: "Unloading Detention",
        key: "unloadingDetention",
        isEditable: true
      }, {
        label: "Late charge",
        key: "lateCharge",
        isEditable: true
      }, {
        label: "Loading",
        key: "loading",
        isEditable: true
      }, {
        label: "Unloading",
        key: "unloading",
        isEditable: true
      }, {
        label: "Green tax",
        key: "greenTax",
        isEditable: true
      }, {
        label: "Other Charges",
        key: "otherCharges",
        isEditable: true
      }];

      if ($scope.globalData && $scope.globalData.tripsData) {
        $scope.tripData = $scope.globalData.tripsData;
        console.log($scope.tripData);
        /*$scope.rateComponents.forEach(function(obj) {
          if ($scope.tripData.updatedTripRatesDto && hasValue($scope.tripData.updatedTripRatesDto[obj.key])) {
            obj.editedValue = $scope.tripData.updatedTripRatesDto[obj.key];
            obj.isEdit = true;
          } else {
            obj.editedValue = $scope.tripData.defaultTripRatesDto[obj.key];
          }
        });*/
      }

      console.log($scope.globalData.tripsData);
       $scope.save = function() {
        console.log($scope.rateComponents);
       }


    }
  ]);
