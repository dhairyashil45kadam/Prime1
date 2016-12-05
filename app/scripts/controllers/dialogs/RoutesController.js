'use strict';

angular.module('financeUiApp')
  .controller('RoutesController', ['$rootScope', '$scope', 'ClientService', '$filter','UserProfileFactory','PermissionConstant',
    function ($rootScope, $scope, ClientService, $filter,UserProfileFactory,PermissionConstant) {

      $scope.route = {};
      $scope.clientRouteForRouteObj = [];
      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;
      $scope.steps = [{
        inProgress: true,
        completed: false
      }, {
        inProgress: false,
        completed: false
      }];
      function showErrorAlert(alert) {
        $scope.showAlert = true;
        $scope.alertMessage = alert;
      }

      function getClientRoutes() {
        $rootScope.$emit('load-start');
        ClientService.getClientRoutes($scope.route.client.id).then(function(routes) {
          $scope.clientRoutes = routes;
          routes.forEach(function(obj , idx) {
            obj.displayName = idx+1 + ") " + obj.clientRouteName + " (" + obj.routeName + ")";
          });

          $rootScope.$emit('load-stop');
        }, function() {
          showErrorAlert("Unable to add rates info. Try again later.");
          $rootScope.$emit('load-stop');
        });
      }

      function getClientBillingDetails() {
        ClientService.getBillingDetails($scope.route.client.id).then(function(billing) {
          $scope.clientBillingDetails = billing;
        }, function() {
          showErrorAlert("Unable to add rates info. Try again later.");
        });
      }

      function hasValue(a) {
        return a || a === 0;
      }

      $scope.onClientSelect = function() {
        // setWarehousesForClient($scope.route.clientId);
        getClientRoutes();
        getClientBillingDetails();
      };

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
        }]
      };

      $scope.routeRateTableData = {
        columns: [{
          label: "Trip type",
          key: "tripType",
          className: "tripType",
          showDownArrow: true,
          formatter: function(value) {
            var text = "";
            $scope.tripTypes.forEach(function(tripType) {
              if(tripType.value === value) {
                text = tripType.text;
              }
            });
            return text;
          }
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
            return $scope.clientBillingDetails.fuelSurcharge;
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
              var changedRow = angular.extend({}, row);
              changedRow.approvalStatus = "APPROVED";
              var userName = $scope.UserProfile.user_name;
              ClientService.changeRouteBillingDetails($scope.route.client.id, row.id,userName, changedRow).then(function() {
                row = changedRow;
              });
            },
            show: function(record) {
              return record.approvalStatus === "PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.approveRates));
            }
          }, {
          label: "Edit",
          action: function(row) {
            var editObj = angular.extend({}, row);
            editObj.client = $scope.route.client;
            editObj.clientRoute = $scope.route.clientRoute;
            $scope.route = editObj;
            if($scope.route.applicableFromDate)
              $scope.route.applicableFromDate = moment($scope.route.applicableFromDate);
            $scope.steps[0] = {
              inProgress: false,
              completed: true
            };
            $scope.steps[1] = {
              inProgress: true,
              completed: false
            };
          },
          show: function(record) {
            return (record.approvalStatus === "APPROVED" || record.approvalStatus === "PENDING") && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.editRoute));
          }
        }]
      };

      $scope.filterRatesEntry = function() {
        var filteredSet = [];
        if($scope.clientExistingRatesEntries && $scope.clientExistingRatesEntries.length > 0) {
          var allRecords = $scope.clientExistingRatesEntries,
            vehicleTypeFilter = $scope.route.vehicleType,
            tripTypeFilter = $scope.route.tripType;
          allRecords.forEach(function(obj) {
            if(vehicleTypeFilter && obj.vehicleType !==  vehicleTypeFilter) {
              return;
            }
            if(tripTypeFilter && tripTypeFilter !== obj.tripType) {
              return;
            }
            filteredSet.push(obj);
          });
        }
        $scope.existingRatesFiltered = filteredSet;
        if(filteredSet && filteredSet.length > 0) {
          $scope.rateAlreadyPresent = true;
        } else {
          $scope.rateAlreadyPresent = false;
        }
      };

      $scope.onRouteSelect = function() {
        $rootScope.$emit('load-start');
        ClientService.getRatesForClientRoute($scope.route.client.id, $scope.route.clientRoute.id).then(function(routesRateInfo) {
          $scope.clientExistingRatesEntries = routesRateInfo;
          $scope.filterRatesEntry();
          $rootScope.$emit('load-stop');
        }, function() {
          $rootScope.$emit('load-stop');
        });
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

      $scope.showAddRateButton = function() {
        if($scope.route.clientRoute && $scope.route.vehicleType && $scope.route.tripType) {
          return true;
        } else {
          return false;
        }
      };
      $scope.$watch('clientRouteForRouteObj', function() {
        if($scope.clientRouteForRouteObj.length > 0) {
          $scope.route.clientRoute = $scope.clientRouteForRouteObj[0];
          if($scope.route.clientRoute) {
          $scope.onRouteSelect();
        }
      }
    });

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

       $scope.uplaodFiles = function(input) {
        $scope.multiPartFile = input.files[0];
      };
      // $scope.setFormData = function(rateDetails) {
      //   var fd = new FormData();
      // //  fd.append("key",rateDetails.loading);
      //   if (rateDetails) {
      //     fd.append('multipartFile',$scope.multiPartFile);
      //   for ( var key in rateDetails) {
      //     if(key != "multipartFile"){
      //     fd.append(key,rateDetails[key])
      //   }
      // }
      //
      // }
      // return fd;
      // }

      $scope.save = function() {

        if(hasValue($scope.route.baseRate)){
          var rateDetails = angular.extend({}, $scope.route);
        }
        if($scope.clientBillingDetails.fuelSurcharge) {
          console.log('fuel present'+ $scope.clientBillingDetails.fuelSurchargeType);
          rateDetails.clientRouteFuelDetailDto.fuelSurchargeType = $scope.clientBillingDetails.fuelSurchargeType;
        }
        if(!(hasValue($scope.route.applicableFromDate) && hasValue($scope.route.baseRate)))
          return false;

        if($scope.clientBillingDetails.fuelSurcharge){
          if(!(hasValue(rateDetails.clientRouteFuelDetailDto.fuelBaseRate) && hasValue(rateDetails.clientRouteFuelDetailDto.applicableAbove) &&
               hasValue(rateDetails.clientRouteFuelDetailDto.baseValue) && hasValue(rateDetails.clientRouteFuelDetailDto.considerationPart) &&
               hasValue(rateDetails.clientRouteFuelDetailDto.fuelRateChangeType)))
              return false;
          if($scope.clientBillingDetails.fuelSurchargeType === "BASERATE_CLAUSE"){
            if(!hasValue(rateDetails.clientRouteFuelDetailDto.baseRateComponent))
              return false;
          }else if($scope.clientBillingDetails.fuelSurchargeType === "MILEAGE_CLAUSE"){
            if(!(hasValue(rateDetails.clientRouteFuelDetailDto.totalDistance) && hasValue(rateDetails.clientRouteFuelDetailDto.mileage)))
              return false;
          }
        }
        rateDetails.clientId = $scope.route.client.id;
        rateDetails.clientRouteId = $scope.route.clientRoute.id;

        delete rateDetails.client;
        delete rateDetails.clientRoute;
        var currentUser = $scope.UserProfile.user_name;
        var fd = new FormData();
        fd.append('documentClientType','ROUTE_BILLING');
        fd.append('documentType','ROUTE_CONTRACT');
        fd.append('clientId',$scope.route.client.id);
        fd.append('multipartFile', $scope.multiPartFile);
        fd.append('currentUser' , currentUser);
        if (rateDetails.approvalStatus === "PENDING") {
          ClientService.changeRouteBillingDetails($scope.route.client.id ,rateDetails.id,currentUser, rateDetails).then(function(response) {
            fd.append('referenceId',response.object.id);
            ClientService.addContractFile(fd ,$scope.route.client.id).then(function(res) {
              console.log("saved successfully");
            });
          }, function() {
            console.log("Error while saving");
          });
        } else {
          ClientService.saveClientRouteBillingDetails($scope.route.client.id, $scope.route.clientRoute.id,currentUser, rateDetails).then(function(response) {
            fd.append('referenceId',response.id);
            ClientService.addContractFile(fd ,$scope.route.client.id).then(function(res) {
              console.log("saved successfully");
            });
          }, function() {
            console.log("Error while saving");
          });
        }
      };

      $scope.tripTypes = [{
        text: "Round trip",
        value: "ROUND_TRIP"
      }, {
        text: "One way",
        value: "ONE_WAY"
      }, {
        text: "Adhoc round trip",
        value: "ADHOC_ROUND_TRIP"
      }, {
        text: "Adhoc one way",
        value: "ADHOC_ONE_WAY"
      }];

      $scope.vehicleTypes = [
        "TYPE_22",
        "TYPE_32",
        "TYPE_22_REEFER",
        "TYPE_32_REEFER",
        "TYPE_24",
        "TYPE_24_REEFER"
      ];
      $scope.fuelRateTypes = [{
        text: "Percentage",
        value: "PERCENTAGE"
      },{
        text: "Absolute",
        value: "ABSOLUTE"
      }];


    }
  ]);
