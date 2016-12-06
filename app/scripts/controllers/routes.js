'use strict';

angular.module('financeUiApp')
  .controller('RoutesCtrl', ['$rootScope', '$scope', 'InvoiceService', 'ClientService', 'ngDialog', '$filter','PermissionConstant','UserProfileFactory',
    function ($rootScope, $scope, InvoiceService, ClientService, ngDialog, $filter,PermissionConstant,UserProfileFactory) {

      $scope.headOpen = true;
      $scope.tabSelected = "PENDING";
      $scope.UserProfile = UserProfileFactory.$$state.value;

      
      
      var fuelSurchargeComponents = {
        'BASERATE_CLAUSE': [{
          label: "Fuel base rate",
          key: "fuelBaseRate"
        }, {
          label: "Fuel component in base rate(%)",
          key: "baseRateComponent"
        }, {
          label: "Fuel surcharge applicable above(%)",
          key: "applicableAbove"
        }, {
          label: "Surcharge base value(%)",
          key: "baseValue"
        }, {
          label: "Fuel rate type",
          key: "fuelRateChangeType"
        }, {
          label: "Consideration part",
          key: "considerationPart"
        }],
        'MILEAGE_CLAUSE': [{
          label: "Fuel base rate",
          key: "fuelBaseRate"
        }, {
          label: "Total distance(Kms)",
          key: "totalDistance"
        }, {
          label: "Mileage",
          key: "mileage"
        }, {
          label: "Fuel surcharge applicable above(%)",
          key: "applicableAbove"
        }, {
          label: "Surcharge base value(%)",
          key: "baseValue"
        }, {
          label: "Consideration part",
          key: "considerationPart"
        }, {
          label: "Fuel rate type",
          key: "fuelRateChangeType"
        }]
      };

      $scope.nonBilledRoutesColumn = {
        columns: [{
          label: "Route name",
          key: "routeName",
          className: "tripType",
          showDownArrow: true
        }, {
          label: "Client route name",
          key: "clientRouteName",
          className: "tripType",
          showDownArrow: true
        }, {
          label: "Via",
          key: "via",
          className: "tripType",
          showDownArrow: true
        }],
        hideActions: true
      };

      $scope.documentsTable = {
        columns: [{
          label: "Document Type",
          key: "documentType",
          formatter: function(value){
            return documentMap(value);
          },
          className: "documentType",
          showDownArrow: true
        },{
          label: "Document Client Type",
          key: "documentClientType",
          formatter: function(value){
            return documentMap(value);
          },
          className: "documentClientType",
          showDownArrow: true
        },{
          label: "Document url",
          key: "documentUrl",
          formatter: function(value) {
            return '<a class="link" href=' + value + '>Document link</a>';
          },
          className: "documentUrl",
          showDownArrow: true
        }],
        hideActions: true
      };

      function documentMap(value){
        switch(value){
          case 'CLIENT_CONTRACT': return "Client Contract";
          case 'CLIENT_BILLING': return "Client Billing";
          case 'ROUTE_BILLING': return "Route Billing";
          case 'ROUTE_CONTRACT': return "Route Contract";
          case 'EMAIL_DOCUMENT': return "Email Document";
        }
      };

      $scope.billedRoutesColumn = {
        columns: [{
          label: "Client route",
          key: "clientRoute",
          className: "tripType",
          showHover: true,
          hover: {
            templateFn: function(record) {
              var templ = "<div class='tripDetailsTooltip'>";
              templ += '<div><div class="title">Created by</div><div class="value">' + record.createdBy + '</div></div>';
              templ += '<div><div class="title">Created date</div><div class="value">' + $filter('date')(record.createdDate, 'dd/MM/yyyy HH:mm') + '</div></div>';
              templ += '<div><div class="title">Approved by</div><div class="value">' + record.approvedBy + '</div></div>';
              templ += '<div><div class="title">Approved date</div><div class="value">' + $filter('date')(record.approvedDate, 'dd/MM/yyyy HH:mm') + '</div></div>';
              templ += '<div><div class="title">Last updated date</div><div class="value">' + $filter('date')(record.lastUpdatedDate, 'dd/MM/yyyy HH:mm') + '</div></div>';
              templ += '</div>';
              return templ;
            }
          },
          showDownArrow: true
        },{
          label: "Route Name",
          key: "routeName",
          className: "tripType",
          showDownArrow: true

        }, {
          label: "Trip type",
          key: "tripType",
          className: "tripType",
          showDownArrow: true,
        }, {
          label: "Vehicle type",
          key: "vehicleType",
          className: "vehicleType",
          showDownArrow: true
        }, {
          label: "Base rate",
          key: "baseRate",
          className: "baseRate",
          showDownArrow: true
        }, {
          label: "Fuel Surcharge applicable?",
          compute: function(record) {
            if(record.clientRouteFuelDetailDto) {
              if((record.clientRouteFuelDetailDto.fuelSurchargeType === "BASERATE_CLAUSE" && !record.clientRouteFuelDetailDto.baseRateComponent) ||
                (record.clientRouteFuelDetailDto.fuelSurchargeType === "MILEAGE_CLAUSE" && !record.clientRouteFuelDetailDto.totalDistance)) {
                return "No";
              } else {
                return "Yes";
              }
            }
          },
          className: "fuelSurcharge",
          show: function() {
            if ($scope.clientBillingDetails) {
              return $scope.clientBillingDetails.fuelSurcharge;
            } else {
              return 0.00;
            }
          },
          showHover: function(record) {
            return record.clientRouteFuelDetailDto;
          },
          hover: {
            templateFn: function(record) {
              var templ = "<div class='fuelTooltip'>";
              fuelSurchargeComponents[record.clientRouteFuelDetailDto.fuelSurchargeType].forEach(function(o) {
                var value = record.clientRouteFuelDetailDto[o.key] || 0;
                templ += '<div><div class="title">'+ o.label + '</div><div class="value">' + value + '</div></div>';
              });
              templ += '<div>';
              return templ;
            }
          },
          showDownArrow: true
        }, {
          label: "Loading Detention",
          key: "loadingDetention",
          className: "loadingDetention",
          showDownArrow: true
        }, {
          label: "Unloading Detention",
          key: "unloadingDetention",
          className: "unloadingDetention",
          showDownArrow: true
        }, {
          label: "Late charge",
          key: "lateCharge",
          className: "lateCharge",
          showDownArrow: true
        }, {
          label: "Loading",
          key: "loading",
          className: "loading",
          showDownArrow: true
        }, {
          label: "Unloading",
          key: "unloading",
          className: "unloading",
          showDownArrow: true
        }, {
          label: "Green tax",
          key: "greenTax",
          className: "greenTax",
          showDownArrow: true
        }, {
          label: "Other Charges",
          key: "otherCharges",
          className: "otherCharges",
          showDownArrow: true
        }, {
          label: "Applicable from date",
          key: "applicableFromDate",
          className: "applicableFromDate",
          showDownArrow: true,
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          }
        }, {
          label: "Applicable till date",
          key: "applicableTillDate",
          className: "applicableTillDate",
          showDownArrow: true,
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          }
        }],
        actions: [{
            label: "Approve",
            action: function(row) {
              var changeIndex = -1;
              for(var i=0; i<$scope.billedRoutes.length; i++){
                if($scope.billedRoutes[i].id == row.id){
                  changeIndex = i;
                  break;
                }
              }
              var changedRow = angular.extend({}, row);
              changedRow.approvalStatus = "APPROVED";
              var currentUser = $scope.UserProfile.user_name;
              ClientService.changeRouteApprovalDetails($scope.filters.client.id, row.id,currentUser, changedRow).then(function() {
                if(changeIndex !== -1){
                  $scope.billedRoutes[i] = changedRow;
                  setTabData();
                }
              });
            },
            show: function() {
              return $scope.tabSelected === "PENDING" && $scope.UserProfile.$hasAnyRole(PermissionConstant.approveRates);
            }
          }, {
          label: "Reject",
          action: function(row) {
              var changeIndex = -1;

              for(var i=0; i<$scope.billedRoutes.length; i++){
                if($scope.billedRoutes[i].id == row.id){
                  changeIndex = i;
                  break;
                }
              }

              var changedRow = angular.extend({}, row);
              changedRow.approvalStatus = "REJECTED";
              var currentUser = $scope.UserProfile.user_name;
              if (row.approvalStatus === "PENDING") {
                ClientService.changeRouteRejectDetails($scope.filters.client.id, row.id,currentUser,changedRow).then(function() {
                  if(changeIndex !== -1) {
                    $scope.billedRoutes[changeIndex] = changedRow;
                    setTabData();
                  }
              });
            } else {
                ClientService.changeRouteRejectDetailsForApproved($scope.filters.client.id, row.id,currentUser,changedRow).then(function() {
                  if(changeIndex !== -1) {
                    $scope.billedRoutes[changeIndex] = changedRow;
                    setTabData();
                  }
                });
              }
            },
          show: function(row) {
            return (($scope.tabSelected === "PENDING"  && $scope.UserProfile.$hasAnyRole(PermissionConstant.rejectRates)) ||
            (row.approvalStatus === "APPROVED" && $scope.UserProfile.$hasAnyRole($scope.PermissionConstant.rejectRatesApproval)));
          }
          },{
            label: "Documents",
            action: function(row) {
              var clientId = row.clientId;
              var referenceId = row.id;
              ClientService.getClientRouteBillingDocument(clientId,referenceId).then(function(res){
                $scope.documents = res;
              });

              $scope.documentDialog = angular.extend({}, $scope.documents);
              var dialog = ngDialog.open({
                templateUrl: 'views/dialogs/viewDocuments.html',
                appendClassName: 'documentDialog',
                scope: $scope,
                closeByDocument: false
              });
            }
        },{
            label: "Calculate Fuel Surcharge",
            action: function(row) {
              var clientId = row.clientId;
              var clientRouteBillingId = row.id;
              var dialog = ngDialog.open({
                templateUrl: 'views/dialogs/calculateFuelSurcharge.html',
                appendClassName: 'fuelSurcharge',
                scope: $scope,
                closeByDocument: false
              });
              dialog.closePromise.then(function (fuelRate) {
                if(fuelRate.value){
                  ClientService.getFuelSurchargeByClientRouteBillingId(clientId, fuelRate, clientRouteBillingId).then(
                    function(response){
                      $scope.amount = response.object;
                      var dialogConfirm = ngDialog.open({
                        templateUrl: 'views/dialogs/showFuelSurcharge.html',
                        appendClassName: 'detailsValue',
                        scope : $scope,
                      });
                    },function(err){
                      $scope.amount = "Technical Error";
                      var dialogConfirm = ngDialog.open({
                        templateUrl: 'views/dialogs/showFuelSurcharge.html',
                        appendClassName: 'detailsValue',
                        scope : $scope,
                      });
                    }
                  );
                }
              }); 
            }
        }]
      };


      var tabTableData = {};

      function setTabData() {
        var tab = $scope.tabSelected;
        $scope.routeData = {};
        var routes = [];
        if ($scope.billedRoutes !== null && tab !== "NOT_YET_ADDED") {
          $scope.billedRoutes.forEach(function(obj) {
            if(tab === "PENDING" && obj.approvalStatus === "PENDING") {
              routes.push(obj);
            } else if(tab === "APPROVED" && obj.approvalStatus === "APPROVED") {
              routes.push(obj);
            } else if(tab === "REJECTED" && obj.approvalStatus === "REJECTED") {
              routes.push(obj);
            }
          });
        }
        if (tab === "NOT_YET_ADDED") {
          if ($scope.nonBilledRoutes !== null) {
            console.log($scope.nonBilledRoutes);
            $scope.nonBilledRoutes.forEach(function(obj) {
              routes.push(obj);
            });
          }
        } else {
          console.log("Nothing is present");
        }

        $scope.routeData = routes;
      }

      $scope.tableToShow = $scope.billedRoutesColumn;

      $scope.tabClicked = function(tab) {
        if($scope.tabSelected && $scope.tabSelected === tab) {
          return;
        }
        $scope.tabSelected = tab;
        if ($scope.tabSelected === "NOT_YET_ADDED") {
          $scope.tableToShow = $scope.nonBilledRoutesColumn;
        } else {
          $scope.tableToShow = $scope.billedRoutesColumn;
        }
        $scope.filter();
      };

      $scope.$watch('tabSelected', function() {
        if($scope.tabSelected) {
          $scope.tabClicked($scope.tabSelected);
        }
      });

      $scope.filter = function() {
        var clientId = $scope.filters.client.id;
        var filters = [];
        if(clientId) {
          filters.push({
            label: "Client",
            values: [$scope.filters.client.clientName]
          });
        }

        $scope.filterValues = filters;
        $scope.headOpen = false;

        ClientService.getBillingDetails(clientId).then(function(billing) {
          $scope.clientBillingDetails = billing;
        }, function() {
          showErrorAlert("Unable to add rates info. Try again later.");
        });

        console.log($scope.clientBillingDetails);

        if ($scope.tabSelected !== "NOT_YET_ADDED") {
          $rootScope.$emit('load-start');
          ClientService.getRoutesForClient(clientId, $scope.tabSelected).then(function(response) {
            $scope.billedRoutes = response.billedRouteList;
            console.log($scope.billedRoutes);
            setTabData();
            $rootScope.$emit('load-stop');
          }, function() {
            $rootScope.$emit('load-stop');
          });
        }

        if ($scope.tabSelected === "NOT_YET_ADDED") {
          $rootScope.$emit('load-start');
          ClientService.getNonAddedRoutesForClient(clientId).then(function(response) {
            if (response.nonBilledRouteList) {
              $scope.nonBilledRoutes = response.nonBilledRouteList;
              console.log($scope.nonBilledRoutes);
              setTabData();
            } else {
              console.log("");
            }
            $rootScope.$emit('load-stop');
            }, function() {
              $rootScope.$emit('load-stop');
          });
        }
      };
    }
  ]);
