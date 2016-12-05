'use strict';

angular.module('financeUiApp')
  .controller('SplitByCategory', ['$rootScope', '$scope', '$filter','UserProfileFactory','PermissionConstant','TripBillingDetailService',
    function ($rootScope, $scope, $filter,UserProfileFactory,PermissionConstant,TripBillingDetailService) {

      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;
      if ($scope.globalData && $scope.globalData.client) {
          $scope.client = $scope.globalData.client;
          $scope.selectedTrips = $scope.globalData.selectedTrips;
          $scope.categories = angular.extend([], $scope.globalData.categories);
      }

      function showErrorAlert(alert) {
          $scope.showAlert = true;
          $scope.alertMessage = alert;
      }

      $scope.finalCategories = [];
      $scope.finalCategories.push($scope.categories);
      function calculateTotals() {
        for (var i = 0; i < $scope.finalCategories.length; i++) {
          var tota = 0, tagName="";
          for (var j = 0; j < $scope.finalCategories[i].length; j++) {
            var tot = 0;
            for (var k = 0; k < $scope.selectedTrips.length; k++) {
              if($scope.selectedTrips[k]['updatedTripRatesDto'] && $scope.selectedTrips[k]['updatedTripRatesDto'][$scope.finalCategories[i][j]['value']] !== null)
                tot += $scope.selectedTrips[k]['updatedTripRatesDto'][$scope.finalCategories[i][j]['value']];
              else if($scope.selectedTrips[k]['defaultTripRatesDto'] && $scope.selectedTrips[k]['defaultTripRatesDto'][$scope.finalCategories[i][j]['value']] !== null) 
                tot += $scope.selectedTrips[k]['defaultTripRatesDto'][$scope.finalCategories[i][j]['value']];
            };
            $scope.finalCategories[i][j].total = tot;
            tota += tot;
            tagName += ($scope.finalCategories[i][j]['name'].split(" ")[0][0] + $scope.finalCategories[i][j]['name'].split(" ")[1][0]);
          };
          $scope.finalCategories[i].total = tota;
          $scope.finalCategories[i].tagName = tagName;
        };
      }

      calculateTotals();
      $scope.displayGroup = function(data) {
        $scope.usedCategories = [];
        for (var i = 0; i < data.length; i++) {
          $scope.usedCategories.push(data[i]);
          for (var j = 0; j < $scope.categories.length; j++) {
            if($scope.categories[j]['name'] === data[i]['name']) {
              $scope.categories.splice(j,1);
            }
          };
        };
        if($scope.usedCategories.length > 0) {
          $scope.finalCategories.push($scope.usedCategories);
          calculateTotals();
        }
      }
      function convertToNum(name) {
        switch(name) {
          case 'baseRate': return '1';break;
          case 'fuelSurcharge': return '2';break;
          case 'loadingDetention': return '3';break;
          case 'unloadingDetention': return '4';break;
          case 'lateCharge': return '5';break;
          case 'loading': return '6';break;
          case 'unloading': return '7';break;
          case 'greenTax': return '8';break;
          case 'otherCharges': return '9';break;
          default: return '0';
        }
      }
      $scope.save = function(onSuccess) {
        for (var i = 0; i < $scope.finalCategories.length; i++) {
          if((!$scope.finalCategories[i].tagName || $scope.finalCategories[i].tagName === "") && $scope.finalCategories[i].length > 0)
            return false;
        }
        var splitCategoryDto = {};
        var splitCriteriaDtoList = [];
        var planningIdList = [];
        var tripBillingIdList = [];
        for (var i = 0; i < $scope.selectedTrips.length; i++) {
          planningIdList.push($scope.selectedTrips[i].planningId);
          tripBillingIdList.push($scope.selectedTrips[i].id);
        };
        for (var i = 0; i < $scope.finalCategories.length; i++) {
          var groupString = [];
          for (var j = 0; j < $scope.finalCategories[i].length; j++) {
            groupString.push(convertToNum($scope.finalCategories[i][j]['value']));
          };
          if(groupString.length > 0){
            var tempDto = {};
            tempDto.componentList = groupString;
            tempDto.tagName = $scope.finalCategories[i].tagName;
            splitCriteriaDtoList.push(tempDto);
          }
        };
        splitCategoryDto.planningIdList = planningIdList;
        splitCategoryDto.tripBillingIdList = tripBillingIdList;
        splitCategoryDto.splitCriteriaDtoList = splitCriteriaDtoList;
        var currentUser = $scope.UserProfile.user_name;
        return TripBillingDetailService.splitByCategory(splitCategoryDto , currentUser).then(function() {
          //tripbillingdetail/splitbycategory
            return true;
        }, function() {
          return false;
        });
      };
    }
  ]);