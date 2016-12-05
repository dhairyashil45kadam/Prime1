'use strict';

angular.module('financeUiApp')
  .controller('TripDetailsCtrl', ['$rootScope', '$scope', 'TripBillingDetailService' , 'UserService', 'ClientService', 'ngDialog','$filter', 'PermissionConstant','UserProfileFactory',
    function ($rootScope, $scope, TripBillingDetailService, UserService, ClientService, ngDialog, $filter, PermissionConstant,UserProfileFactory) {

      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      $scope.headOpen = true;
      $scope.tabSelected = "PENDING";
      $scope.groupFilter = "all";
      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      //Utility Functions

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



      //Building table to show
      var tripDetailsTableData={
        columns: [{
          label: "Vehicle Number",
          key: "vehicleNumber"
        },{
          label: "Trip Code",
          key: "tripCode"
        },{
          label: "Trip Start Time",
          key: "startTime",
          formatter: function(value) {
              return $filter('date')(value, 'dd/MM/yyyy HH:mm');
            }
        },{
          label: "Trip End Time",
          key: "endTime",
          formatter: function(value) {
              return $filter('date')(value, 'dd/MM/yyyy HH:mm');
            }
        },{
          label: "Distance(GPS)",
          key: "distanceCovered"
        },{
          label: "Distance(Σ Hubs)",
          key: "actualDistance"
        },{
          label: "Billing Status",
          key: "tripBillingStatus",
          formatter: function(value) {
            switch(value){
              case 'PENDING'                  : return "Pending";
              case 'INVOICE_GENERATED'        : return "Invoice Generated";
              case 'BD_APPROVED'              : return "BD Rejected";
              case 'PENDING_WITH_BD_REJECTED' : return "Pending/BD Rejected";
              case 'ANNEXURE_CREATED'         : return "Annexure Created";
              default                         : return value;
            }
          }
        }],
        hideActions: true
      };

      $scope.tripDetailsTableData = tripDetailsTableData;
      $scope.clients = {};
      ClientService.getClientsDetails($scope.UserProfile.user_name).then(function(res){
        $scope.clients = res;

      },function(){
        console.log("Could not get clients");
      });

      $scope.filter = function() {
        var client = $scope.filters.client,
        startDate, endDate, dateFilterType;

        var filters =[];

        if(client){
          filters.push({
            label: "Client Name",
            value: [client]
          });
        }

        if($scope.filters.dateFilter){
          dateFilterType= $scope.filters.tripDatesFilter;
          startDate = $scope.filters.fromDate;
          endDate = $scope.filters.toDate;
          var date = "";
          if(startDate) {
            date += startDate.format('DD/MM/YYYY HH:mm') + " - ";
          }
          if(endDate) {
            date += endDate.format('DD/MM/YYYY HH:mm');
          }
          filters.push({
            label: dateFilterType==="START"? 'Trip start range':'Trip closure range',
            values: [date]
          });
        }

        $scope.filtervalues = filters;
        $scope.headOpen = false;
        $rootScope.$emit('load-start');
        TripBillingDetailService.getTripBillingDetailsList(client.id, startDate, endDate).then(function(response){
          $scope.tripDetailsList = response.object;
          $rootScope.$emit('load-stop');
        },function(){
          console.log("Could not get trips billing list");
          $rootScope.$emit('load-stop');
        });
      };
    }
  ]);