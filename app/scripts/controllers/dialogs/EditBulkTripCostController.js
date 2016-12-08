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

      //console.log($scope.globalData.tripsData);
       $scope.save = function() {
        var bulkEditTrip = [];
        //var editTrip[i]["clientTripBillingDetailDto"] = {};
        var clientId = $scope.tripData[0].clientId;
        $scope.tripData.forEach(function(o,i) {
          //o["tripRateDto"]=$scope.rateComponents;
          //console.log(o);
          var editTrip = {};
          editTrip.clientTripBillingDetailDto = o;
          editTrip.clientId = o.clientId;

          editTrip.clientTripBillingDetailDto.tripRateDto = {};
          $scope.rateComponents.forEach(function(o) {
            editTrip.clientTripBillingDetailDto.tripRateDto[o.key] = o.editedValue;
          });
          editTrip.clientTripBillingDetailDto.comments = $scope.comments;
          bulkEditTrip[i] = editTrip;
          //editTrip[i]["clientTripBillingDetailDto"].push(o);
        });
        console.log(bulkEditTrip);
       }
    }
  ]);
