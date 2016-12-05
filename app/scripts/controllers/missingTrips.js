'use strict';

angular.module('financeUiApp')
  .controller('MissingTripsCtrl', ['$rootScope', '$scope','UserService', 'MissingTripsService', 'ngDialog','$filter', 'PermissionConstant','UserProfileFactory',
    function ($rootScope, $scope,UserService, MissingTripsService, ngDialog, $filter, PermissionConstant,UserProfileFactory) {

      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      $scope.headOpen = true;
      $scope.tabSelected = "PENDING";
      $scope.groupFilter = "all";
      $scope.showEvents = [];
      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      function hasValue(a) {
        return a || a === 0;
      }

      function isChanged(a, b) {
        return a - b !== 0;
      }

      function truncateValue(a) {
        if(!a) {
          a = 0;
        }
        if(typeof a === "string") {
          a = a.replace(/,/g, '');     //remove , from a formatted value
        }
        return $filter('number')(a, 2);
      }

      var commonMissingTableData={
        columns: [{
          label: "Vehicle No.",
          key: "vehicleNumber"
        },{
          label: "Current trip planning id",
          key: "currentTripPlanningId"
        },{
          label: "Current client code",
          key: "currentClientCode"
        },{
          label: "Current trip start point",
          key: "currentTripStartPoint"
        },{
          label: "Current trip start hub",
          key: "currentTripStartHub"
        },{
          label: "Current trip start time",
          key: "currentTripStartTime",
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          }
        },{
          label: "Previous trip planning id",
          key: "previousTripPlanningId"
        },{
          label: "Previous client code",
          key: "previousClientCode"
        },{
          label: "Previous trip end point",
          key: "previousTripEndPoint"
        },{
          label: "Previous trip end hub",
          key: "previousTripEndHub"
        },{
          label: "Previous trip end time",
          key: "previousTripEndTime",
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          }
        },{
          label: "Distance between warehouses",
          key: "distanceBetweenEndPoints",
          formatter: function(value){
            return truncateValue(value);
          }
        },{
          label: "Distance between start and end hubs",
          key: "distanceBetweenHubs",
          formatter: function(value){
            return truncateValue(value);
          }
        }],
        hideActions :true
      };

      $scope.missingTripTableData = commonMissingTableData;

      $scope.vehicles = {};
      $scope.startHubs = {};
      $scope.endHubs = {};

      MissingTripsService.getAllVehicles().then(function(res){
        $scope.vehicles = res;
      },function(){
        console.log("Could not get vehicles");
      });
      
      MissingTripsService.getAllStartHubs().then(function(res){
        $scope.startHubs = res;
      },function(){
        console.log("Could not get start hubs");
      });

      MissingTripsService.getAllEndHubs().then(function(res){
        $scope.endHubs = res;
      },function(){
        console.log("Could not get end hubs");
      });
      
      $scope.filters = {};
      $scope.filter = function() {
        var vehicleNumber = $scope.filters.vehicle,
        client = $scope.filters.client,
        startingLocation = $scope.filters.startHub,
        endLocation = $scope.filters.endHub,
        kmgt = $scope.filters.distancegrt,
        kmlt = $scope.filters.distancelt,
        status = $scope.filters.tripStatus,
        startDate, endDate, dateFilterType;

        var filters =[];

        if(vehicleNumber){
          filters.push({
            label: "Vehicle No.",
            value: vehicleNumber
          });
        }
        if(client){
          filters.push({
            label: "Client",
            value: [client.code]
          });
        }

        if(startingLocation){
          filters.push({
            label: "Starting Location",
            value: startingLocation
          });
        }
        if(endLocation){
          filters.push({
            label: "End Location",
            value: endLocation
          });
        }
        if(kmgt){
          filters.push({
            label:"Distance greater than",
            value: kmgt
          });
        }
        if(kmlt){
          filters.push({
            label: "Distance less than",
            value: kmlt
          });
        }
        if(status){
          filters.push({
            label: "Trip Status",
            value: status
          });
        }

        if($scope.filters.dateFilter){
          dateFilterType= $scope.filters.tripDatesFilter;
          startDate = $scope.filters.fromDate;
          endDate = $scope.filters.toDate;
          var date = "";
          if(startDate) {
            date += startDate + " - ";
          }
          if(endDate) {
            date += endDate;
          }
          filters.push({
            label: dateFilterType==="START"? 'Trip start range':'Trip closure range',
            values: [date]
          });
        }

        $scope.filtervalues = filters;
        $scope.headOpen = false;
        $rootScope.$emit('load-start');
        MissingTripsService.getMissingTripDetailsList(vehicleNumber,client,startingLocation,endLocation,
          dateFilterType,startDate,endDate,kmgt,kmlt,status).then(function(response){
          $scope.missingTripList = response;
          $scope.showEvents = $scope.missingTripList;
          setTabData();
          $rootScope.$emit('load-stop');
        },function(){
          console.log("Could not get missing trips list");
          $scope.missingTripList = {};
          $scope.showEvents = $scope.missingTripList;
          setTabData();
          $rootScope.$emit('load-stop');
          var dialog = ngDialog.open({
            templateUrl: 'views/dialogs/missingTripsErrorField.html',
          });
        });
      };

      
      function setTabData(){
        $scope.missingTripTableData = {};
        $scope.selectedMissingTrips = [];
        angular.extend($scope.missingTripTableData, commonMissingTableData);
        var trips = [];
        if($scope.showEvents.length > 0){
          $scope.showEvents.forEach(function(obj){
            trips.push(obj);
          });
        }
        $scope.missingTripsData = trips;
      }
    }
  ]);
