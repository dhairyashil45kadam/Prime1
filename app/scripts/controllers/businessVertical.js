'use strict';

angular.module('financeUiApp')
  .controller('BusinessVerticalCtrl', ['$rootScope', '$scope', 'FinanceReportService' , 'UserService', 'ClientService', 'ngDialog','$filter', 'PermissionConstant','UserProfileFactory',
    function ($rootScope, $scope, FinanceReportService, UserService, ClientService, ngDialog, $filter, PermissionConstant,UserProfileFactory) {

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

      function defaultRatesSum(tripRatesDto){
        var total = 0;
        if(tripRatesDto.baseRate){
          total+=tripRatesDto.baseRate;
        }
        if(tripRatesDto.fuelSurcharge){
          total+=tripRatesDto.fuelSurcharge;
        }
        if(tripRatesDto.loadingDetention){
          total+=tripRatesDto.loadingDetention;
        }
        if(tripRatesDto.unloadingDetention){
          total+=tripRatesDto.unloadingDetention;
        }
        if(tripRatesDto.loading){
          total+=tripRatesDto.loading;
        }
        if(tripRatesDto.unloading){
          total+=tripRatesDto.unloading;
        }
        if(tripRatesDto.lateCharges){
          total+=tripRatesDto.lateCharges;
        }
        if(tripRatesDto.greenTax){
          total+=tripRatesDto.greenTax;
        }
        if(tripRatesDto.weight){
          total+=tripRatesDto.weight;
        }
        if(tripRatesDto.otherCharges){
          total+=tripRatesDto.otherCharges;
        }
        return total;
      }

      var tripDetailsTableData= {
        columns: [{
          label: "Client code",
          key: "clientCode"
        },{
          label: "Vertical",
          key: "businessVertical"
        },{
          label: "Client type",
          key: "clientType"
        },{
          label: "Planning Id",
          key: "planningId"
        },{
          label: "Trip code",
          key: "tripCode"
        },{
          label: "Invoice Initials",
          key: "invoiceInitials"
        },{
          label: "Invoice Id",
          key: "invoiceId"
        },{
          label: "Origin",
          key: "startPoint"
        },{
          label: "Touching",
          key: "touching"
        },{
          label: "Destination",
          key: "destination"
        },{
          label: "Trip type",
          key: "tripType"
        },{
          label: "Vehicle type",
          key: "vehicleType"
        },{
          label: "Distance(kms)",
          key: "distanceCovered"
        },{
          label: "Trip billing status",
          key: "tripBillingStatus"
        },{
          label: "Invoice billing status",
          key: "invoiceBillingStatus",
        },{
          label: "Client route",
          key: "clientRouteName"
        },{
          label: "Start time",
          key: "startTime",
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          }
        },{
          label: "End time",
          key: "endTime",
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          }
        },{
          label: "Default trip rates",
          className: "defaultTripRatesDto",
          compute: function(record) {
            if (record.defaultTripRatesDto) {
              return defaultRatesSum(record.defaultTripRatesDto);
            } 
            return "0.00";
          },
          showHover: true,
          hover: {
            templateFn: function(record) {
               if(record && record.defaultTripRatesDto){
                var templ = "<div class='ratesDTO'>";
                templ += '<div><div class="title">Base rate:</div><div class="value">' + record.defaultTripRatesDto.baseRate + '</div></div>';
                templ += '<div><div class="title">Fuel surcharge:</div><div class="value">' + record.defaultTripRatesDto.fuelSurcharge + '</div></div>';
                templ += '<div><div class="title">Loading detention:</div><div class="value">' + record.defaultTripRatesDto.loadingDetention + '</div></div>';
                templ += '<div><div class="title">Unloading detention:</div><div class="value">' + record.defaultTripRatesDto.unloadingDetention + '</div></div>';
                templ += '<div><div class="title">Loading:</div><div class="value">' + record.defaultTripRatesDto.loading + '</div></div>';
                templ += '<div><div class="title">Unloading:</div><div class="value">' + record.defaultTripRatesDto.unloading + '</div></div>';
                templ += '<div><div class="title">Green tax:</div><div class="value">' + record.defaultTripRatesDto.greenTax + '</div></div>';
                templ += '<div><div class="title">Other charges:</div><div class="value">' + record.defaultTripRatesDto.otherCharges + '</div></div>';
                templ += '</div>';
                return templ;
               }
            }
          }
        },{
          label: "Updated trip rates",
          className: "updatedTripRatesDto",
          compute: function(record) {
            if (record.updatedTripRatesDto) {
              return defaultRatesSum(record.updatedTripRatesDto);
            } 
            return "0.00";
          },
          showHover: true,
          hover: {
            templateFn: function(record) {
               if(record && record.updatedTripRatesDto){
                var templ = "<div class='ratesDTO'>";
                templ += '<div><div class="title">Base rate:</div><div class="value">' + record.updatedTripRatesDto.baseRate + '</div></div>';
                templ += '<div><div class="title">Fuel surcharge:</div><div class="value">' + record.updatedTripRatesDto.fuelSurcharge + '</div></div>';
                templ += '<div><div class="title">Loading detention:</div><div class="value">' + record.updatedTripRatesDto.loadingDetention + '</div></div>';
                templ += '<div><div class="title">Unloading detention:</div><div class="value">' + record.updatedTripRatesDto.unloadingDetention + '</div></div>';
                templ += '<div><div class="title">Loading:</div><div class="value">' + record.updatedTripRatesDto.loading + '</div></div>';
                templ += '<div><div class="title">Unloading:</div><div class="value">' + record.updatedTripRatesDto.unloading + '</div></div>';
                templ += '<div><div class="title">Green tax:</div><div class="value">' + record.updatedTripRatesDto.greenTax + '</div></div>';
                templ += '<div><div class="title">Other charges:</div><div class="value">' + record.updatedTripRatesDto.otherCharges + '</div></div>';
                templ += '<div><div class="title">Weight:</div><div class="value">' + record.updatedTripRatesDto.weight + '</div></div>';

                templ += '</div>';
                return templ;
               }
            }
          }
        },{
          label: "Invoice Amt",
          key: "invoiceAmount",
        }],
        hideActions: true
      };

      $scope.tripDetailsTableData = tripDetailsTableData;
      $scope.clients = {};
      $scope.verticals = [
        {vertical: 'PRIME'},
        {vertical: 'GREEN'},
        {vertical: 'ZOOM'},
        {vertical: 'RIVIGO_GREEN'},
        {vertical: 'FMCG_PHARMA'},
        {vertical: 'ECOM_3PL'},
        {vertical: 'AUTO_WHITE_GOODS'}];
      $scope.statuses = [
        {status: 'PENDING'},
        {status: 'INVOICE_GENERATED'},
        {status: 'BD_APPROVED'},
        {status: 'PENDING_WITH_BD_REJECTED'},
        {status: 'ANNEXURE_CREATED'}];
      
      ClientService.getClientsDetails($scope.UserProfile.user_name).then(function(res){
        $scope.clients = res;
        console.log(res);
      },function(){
        console.log("Could not get clients");
      });

      $scope.filter = function() {
        var clients = $scope.filters.clients;
        var verticals= $scope.filters.verticals;
        var statuses = $scope.filters.statuses;
        var dateFilterType,startDate,endDate;
        var clientIdList = [], verticalList=[], statusList=[];
        var filters =[];

        if(clients){
          clients.forEach(function(cl){
            filters.push({
              label: "Client Name",
              value: [cl]
            });
            clientIdList.push(cl.id);
          });
        }
        if(verticals){
          verticals.forEach(function(vl){
            filters.push({
              label: "Vertical",
              value: [vl]
            });
            verticalList.push(vl.vertical);
          });
        }
        if(statuses){
          statuses.forEach(function(st){
            filters.push({
              label: "Status",
              value: [st]
            });
            statusList.push(st.status);
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
        FinanceReportService.getFinanceReportForClient(clientIdList, verticalList, dateFilterType, startDate, endDate,statusList).then(function(response){
          $scope.tripDetailsList = response;
          console.log(response);
          $rootScope.$emit('load-stop');
        },function(){
          $scope.tripDetailsList = {};
          console.log("Could not get trips billing list");
          $rootScope.$emit('load-stop');
        });
      };
      $scope.downloadDataCSV = function() {
        var extraColumns = [
        {
          label: "Default base rate",
          key: "defaultTripRatesDto",
          formatter: function(value){
            if(value){
              return value.baseRate;
            }
          }
        }, {
          label: "Default fuel surcharge",
          key: "defaultTripRatesDto",
          formatter: function(value){
            if(value){
              return value.fuelSurcharge;
            }
          }
        }, {
          label: "Default loading detention",
          key: "defaultTripRatesDto",
          formatter: function(value){
            if(value){
              return value.loadingDetention;
            }
          }
        }, {
          label: "Default unloading detention",
          key: "defaultTripRatesDto",
          formatter: function(value){
            if(value){
              return value.unloadingDetention;
            }
          }
        }, {
          label: "Default loading",
          key: "defaultTripRatesDto",
          formatter: function(value){
            if(value){
              return value.loading;
            }
          }
        },{
          label: "Default unloading",
          key: "defaultTripRatesDto",
          formatter: function(value){
            if(value){
              return value.unloading;
            }
          }
        },{
          label: "Default green tax",
          key: "defaultTripRatesDto",
          formatter: function(value){
            if(value){
              return value.greenTax;
            }
          }
        },{
          label: "Default other charges",
          key: "defaultTripRatesDto",
          formatter: function(value){
            if(value){
              return value.otherCharges;
            }
          }
        },{
          label: "Updated base rate",
          key: "updatedTripRatesDto",
          formatter: function(value){
            if(value){
              return value.baseRate;
            }
          }
        }, {
          label: "Updated fuel surcharge",
          key: "updatedTripRatesDto",
          formatter: function(value){
            if(value){
              return value.fuelSurcharge;
            }
          }
        }, {
          label: "Updated loading detention",
          key: "updatedTripRatesDto",
          formatter: function(value){
            if(value){
              return value.loadingDetention;
            }
          }
        }, {
          label: "Updated unloading detention",
          key: "updatedTripRatesDto",
          formatter: function(value){
            if(value){
              return value.unloadingDetention;
            }
          }
        }, {
          label: "Updated loading",
          key: "updatedTripRatesDto",
          formatter: function(value){
            if(value){
              return value.loading;
            }
          }
        },{
          label: "Updated unloading",
          key: "updatedTripRatesDto",
          formatter: function(value){
            if(value){
              return value.unloading;
            }
          }
        },{
          label: "Updated green tax",
          key: "updatedTripRatesDto",
          formatter: function(value){
            if(value){
              return value.greenTax;
            }
          }
        },{
          label: "Updated other charges",
          key: "updatedTripRatesDto",
          formatter: function(value){
            if(value){
              return value.otherCharges;
            }
          }
        },{
          label: "Updated weight",
          key: "updatedTripRatesDto",
          formatter: function(value){
            if(value){
              return value.weight;
            }
          }
        }];

        var csvName = "Report-"+Date() ;
        var columns = $scope.tripDetailsTableData.columns.concat(extraColumns);
        $rootScope.JSONToCSVConvertor($scope.tripDetailsList, csvName, columns);
      };
    }
  ]);