'use strict';

angular.module('financeUiApp')
  .controller('SupplementaryTripController', ['$rootScope', '$scope', 'ClientService', '$filter','PermissionConstant','UserProfileFactory',
    function ($rootScope, $scope, ClientService, $filter,PermissionConstant,UserProfileFactory) {

      $scope.newSupplementaryTrip = {};
      $scope.clientRouteForRouteObj = [];
      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.steps = [{
        inProgress: true,
        completed: false
      }, {
        inProgress: false,
        completed: false
      }];
      function showAlert(alert, error) {
        $scope.showAlert = true;
        $scope.alertMessage = alert;
        if(error) {
          $scope.errorAlert = true;
        } else {
          $scope.errorAlert = false;
        }
      }

        $scope.getTripBillingDetail = function() {
          if ($scope.newSupplementaryTrip) {
            $rootScope.$emit('load-start');
            ClientService.getTripBillingDetail($scope.newSupplementaryTrip.client.id  , $scope.newSupplementaryTrip.planningId).then(function(response) {
                $scope.tripbillingdetailObj = response[0];
                $rootScope.$emit('load-stop');
              }, function() {
                showAlert("No trips exist for " + $scope.newSupplementaryTrip.client.clientName + " and trip code " + $scope.newSupplementaryTrip.planningId , true);
                $rootScope.$emit('load-stop');
            });
          }
        };
      $scope.changeSelection = function() {
        $scope.steps = [{
          inProgress: true,
          completed: true
        }, {
          inProgress: false,
          completed: false
        }];
      };


      $scope.addRate = function() {
        $scope.steps[0] = {
          inProgress: false,
          completed: true
        };
        $scope.steps[1] = {
          inProgress: true,
          completed: false
        };
      };

      $scope.save = function() {
        if($scope.newSupplementaryTrip) {
          $scope.newSupplementaryTrip.clientId = $scope.newSupplementaryTrip.client.id;
          $scope.newSupplementaryTrip.currentUser = $scope.UserProfile.user_name;
        $rootScope.$emit('load-start');
        ClientService.saveSupplementTrip($scope.newSupplementaryTrip).then(function(response) {
          console.log("Saved supplement trip successfully");
          $rootScope.$emit('load-stop');
        }, function() {
          showAlert("Error while saving supplement trip",true);
          $rootScope.$emit('load-stop');
        });
      }
      };
    }
  ]);
