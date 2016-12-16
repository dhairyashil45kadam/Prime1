'use strict';

angular.module('financeUiApp')
  .controller('InvoiceCtrl', ['$rootScope', '$scope', 'InvoiceService', 'TripBillingDetailService', 'ClientService', 'ngDialog', '$filter','UserProfileFactory','PermissionConstant',
    function ($rootScope, $scope, InvoiceService, TripBillingDetailService, ClientService, ngDialog, $filter , UserProfileFactory , PermissionConstant) {

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

      //function to bulk edit trip cost
      $scope.EditBulkTripCost = function () {
        if ($scope.selectedTrips.length>0) {
          $rootScope.$emit('show-topDrawer', {
                template: 'views/dialogs/EditBulkTripCost.html',
                controller: 'EditBulkTripCostController',
                successCallback: function() {
                  $rootScope.$emit('load-start');
                  $scope.filter();
                },
                data:{
                  tripsData: $scope.selectedTrips
                },
                heading: "Bulk Edit Trip Rates"
              });
        }else{
          alert("Please Select atleast 1 record to bulk edit");
        }  
      }

      var invoiceBreakupComponents = ['baseRate', 'fuelSurcharge', 'loadingDetention', 'unloadingDetention', 'lateCharge', 'loading', 'unloading', 'greenTax', 'otherCharges'];

      var commonInvoiceTableData = {
        columns: [{
          label: "Trip code",
          key: "tripCode",
          className: "tripCode",
          showDownArrow: true,
          showHover: true,
          hover: {
            templateFn: function(record) {
              var templ = "<div class='tripDetailsTooltip'>";
              templ += '<div><div class="title">Vehicle No.</div><div class="value">' + record.vehicleNumber + '</div></div>';
              templ += '<div><div class="title">Trip type</div><div class="value">' + record.tripType + '</div></div>';
              templ += '<div><div class="title">Vehicle type</div><div class="value">' + record.vehicleType + '</div></div>';
              templ += '<div><div class="title">Trip start time</div><div class="value">' + $filter('date')(record.startTime, 'dd/MM/yyyy HH:mm') + '</div></div>';
              templ += '<div><div class="title">Trip end time</div><div class="value">' + $filter('date')(record.endTime, 'dd/MM/yyyy HH:mm') + '</div></div>';
              templ += '<div><div class="title">Actual distance</div><div class="value">' + record.actualDistance + '</div></div>';
              templ += '<div><div class="title">Distance covered</div><div class="value">' + record.distanceCovered + '</div></div>';
              templ += '</div>';
              return templ;
            }
          }
        }, {
          label: "Vehicle type",
          key: "vehicleType",
          sortable: true,
          className: "vehicleType",
          compute: function(record){
            if(record.vehicleType){
              return record.vehicleType;
            }
          }
        },{
          label: "Route",
          key: "clientRoute",
          className: "clientRoute",
          showDownArrow: true
        }, {
          label: "Base rate",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.baseRate) && isChanged(record.defaultTripRatesDto.baseRate , record.updatedTripRatesDto.baseRate)) {
              return truncateValue(record.updatedTripRatesDto.baseRate);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.baseRate)) {
              return truncateValue(record.defaultTripRatesDto.baseRate);
            }
            return "0.00";
          },
          className: "baseRate",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.baseRate) && isChanged(record.defaultTripRatesDto.baseRate , record.updatedTripRatesDto.baseRate)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.baseRate) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.baseRate) + '</div>';
            }
            return truncateValue(value);
          },
          showHover: function(record) {
            if(record && hasValue(record.weight) && (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.weight))) {
              return true;
            }
          },
          hover: {
            templateFn: function(record) {
              var templ = "<div class = 'updatedTripRatesDtoHover'>";
              templ +='<div><div class="title">Total weight/kilometer: </div><div class="value">' + record.weight +  '</div></div>';
              templ += '<div><div class="title">Weight/kilometer share: </div><div class="value">' + record.updatedTripRatesDto.weight + '</div></div>';
              templ += '</div>';
              return templ;
            }
          }
        }, {
          label: "Fuel surcharge",
          className: "fuelSurcharge",
          showDownArrow: true,
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.fuelSurcharge) && isChanged(record.defaultTripRatesDto.fuelSurcharge , record.updatedTripRatesDto.fuelSurcharge)) {
              return truncateValue(record.updatedTripRatesDto.fuelSurcharge);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.fuelSurcharge)) {
              return truncateValue(record.defaultTripRatesDto.fuelSurcharge);
            }
            return "0.00";
          },
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.fuelSurcharge) && isChanged(record.defaultTripRatesDto.fuelSurcharge , record.updatedTripRatesDto.fuelSurcharge)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.fuelSurcharge) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.fuelSurcharge) + '</div>';
            }
            return truncateValue(value);
          },
          showHover: true,
          hover:{
            templateFn: function(record){
              var templ = "<div class = 'clientRouteFuelDetail'>";
              if(record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.currentFuelRate)){
                templ += '<div><div class="title">Current fuel rate : </div><div class = "value">' + record.defaultTripRatesDto.currentFuelRate + '</div></div>';
              }
              if(record.clientRouteFuelDetailDto){
                var tmpDto = record.clientRouteFuelDetailDto;
                if(hasValue(tmpDto.fuelSurchargeType)){
                  templ+= '<div><div class="title">Fuel surcharge type: </div><div class="value">' + tmpDto.fuelSurchargeType +  '</div></div>';
                }
                if(hasValue(tmpDto.fuelBaseRate)){
                  templ+= '<div><div class="title">Fuel base rate: </div><div class="value">' + tmpDto.fuelBaseRate +  '</div></div>';
                }
                if(hasValue(tmpDto.applicableAbove)){
                  templ+= '<div><div class="title">Applicable above: </div><div class="value">' + tmpDto.applicableAbove +  '</div></div>';
                }
                if(hasValue(tmpDto.considerationPart)){
                  templ+= '<div><div class="title">Consideration part: </div><div class="value">' + tmpDto.considerationPart +  '</div></div>';
                }
                if(hasValue(tmpDto.fuelRateChangeType)){
                  templ+= '<div><div class="title">Fuel rate change type: </div><div class="value">' + tmpDto.fuelRateChangeType +  '</div></div>';
                }
                if(hasValue(tmpDto.baseValue)){
                  templ+= '<div><div class="title">Base value: </div><div class="value">' + tmpDto.baseValue +  '</div></div>';
                }
                if(hasValue(tmpDto.mileage)){
                  templ+= '<div><div class="title">Mileage: </div><div class="value">' + tmpDto.mileage +  '</div></div>';
                  templ+= '<div><div class="title">Total distance: </div><div class="value">' + tmpDto.totalDistance +  '</div></div>';
                }
                return templ;
              }
            }
          },
        }, {
          label: "Loading detention",
          showHover: true,
          hover: {
            templateFn: function(record) {
              if(record.detentionDetailDto && record.detentionDetailDto.delayDataDtoList){
                var templ = "<div class='tripDetailsTooltip'>";
                templ += '<div><div class="title">Start cwh id</div><div class="value">' + record.detentionDetailDto.delayDataDtoList[0].cwhId + '</div></div>';
                templ += '<div><div class="title">Start cwh in time</div><div class="value">' + $filter('date')(record.detentionDetailDto.delayDataDtoList[0].manualCwhInTime, 'dd/MM/yyyy HH:mm') + '</div></div>';
                templ += '<div><div class="title">Start cwh out time</div><div class="value">' + $filter('date')(record.detentionDetailDto.delayDataDtoList[0].manualCwhOutTime, 'dd/MM/yyyy HH:mm') + '</div></div>';
                templ += '<div><div class="title">Start cwh delay</div><div class="value">' + record.detentionDetailDto.delayDataDtoList[0].delay + '</div></div>';
                templ += '</div>';
                return templ;
              }
            }
          },
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.loadingDetention) && isChanged(record.defaultTripRatesDto.loadingDetention , record.updatedTripRatesDto.loadingDetention)) {
              return truncateValue(record.updatedTripRatesDto.loadingDetention);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.loadingDetention)) {
              return truncateValue(record.defaultTripRatesDto.loadingDetention);
            }
            return "0.00";
          },
          className: "loadingDetention",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.loadingDetention) && isChanged(record.defaultTripRatesDto.loadingDetention , record.updatedTripRatesDto.loadingDetention)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.loadingDetention) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.loadingDetention) + '</div>';
            }
            return truncateValue(value);
          },
        }, {
          label: "Unloading detention",
          showHover: true,
          hover: {
            templateFn: function(record) {
              if(record.detentionDetailDto && record.detentionDetailDto.delayDataDtoList ){
                var templ = "<div class='tripDetailsTooltip'>";
                templ += '<div><div class="title">End cwh id</div><div class="value">' + record.detentionDetailDto.delayDataDtoList[1].cwhId + '</div></div>';
                templ += '<div><div class="title">End cwh in time</div><div class="value">' + $filter('date')(record.detentionDetailDto.delayDataDtoList[1].manualCwhInTime, 'dd/MM/yyyy HH:mm') + '</div></div>';
                templ += '<div><div class="title">End cwh out time</div><div class="value">' + $filter('date')(record.detentionDetailDto.delayDataDtoList[1].manualCwhOutTime, 'dd/MM/yyyy HH:mm') + '</div></div>';
                templ += '<div><div class="title">End cwh delay</div><div class="value">' + record.detentionDetailDto.delayDataDtoList[1].delay + '</div></div>';
                templ += '</div>';
                return templ;
              }
            }
          },
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.unloadingDetention) && isChanged(record.defaultTripRatesDto.unloadingDetention , record.updatedTripRatesDto.unloadingDetention)) {
              return truncateValue(record.updatedTripRatesDto.unloadingDetention);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.unloadingDetention)) {
              return truncateValue(record.defaultTripRatesDto.unloadingDetention);
            }
            return "0.00";
          },
          className: "unloadingDetention",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.unloadingDetention) && isChanged(record.defaultTripRatesDto.unloadingDetention , record.updatedTripRatesDto.unloadingDetention)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.unloadingDetention) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.unloadingDetention) + '</div>';
            }
            return truncateValue(value);
          },
        }, {
          label: "Late charge",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.lateCharge) && isChanged(record.defaultTripRatesDto.lateCharge , record.updatedTripRatesDto.lateCharge)) {
              return truncateValue(record.updatedTripRatesDto.lateCharge);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.lateCharge)) {
              return truncateValue(record.defaultTripRatesDto.lateCharge);
            }
            return "0.00";
          },
          className: "lateCharge",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.lateCharge) && isChanged(record.defaultTripRatesDto.lateCharge , record.updatedTripRatesDto.lateCharge)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.lateCharge) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.lateCharge) + '</div>';
            }
            return truncateValue(value);
          },
        }, {
          label: "Loading",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.loading) && isChanged(record.defaultTripRatesDto.loading , record.updatedTripRatesDto.loading)) {
              return truncateValue(record.updatedTripRatesDto.loading);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.loading)) {
              return truncateValue(record.defaultTripRatesDto.loading);
            }
            return "0.00";
          },
          className: "loadingRate",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.loading) && isChanged(record.defaultTripRatesDto.loading , record.updatedTripRatesDto.loading)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.loadingRate) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.loading) + '</div>';
            }
            return truncateValue(value);
          },
        }, {
          label: "Unloading",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.unloading) && isChanged(record.defaultTripRatesDto.unloading , record.updatedTripRatesDto.unloading)) {
              return truncateValue(record.updatedTripRatesDto.unloading);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.unloading)) {
              return truncateValue(record.defaultTripRatesDto.unloading);
            }
            return "0.00";
          },
          className: "unloadingRate",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.unloading) && isChanged(record.defaultTripRatesDto.unloading , record.updatedTripRatesDto.unloading)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.unloading) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.unloading) + '</div>';
            }
            return truncateValue(value);
          },
        }, {
          label: "Green tax",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.greenTax) && isChanged(record.defaultTripRatesDto.greenTax , record.updatedTripRatesDto.greenTax)) {
              return truncateValue(record.updatedTripRatesDto.greenTax);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.greenTax)) {
              return truncateValue(record.defaultTripRatesDto.greenTax);
            }
            return "0.00";
          },
          className: "greenTax",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.greenTax) && isChanged(record.defaultTripRatesDto.greenTax , record.updatedTripRatesDto.greenTax)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.greenTax) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.greenTax) + '</div>';
            }
            return truncateValue(value);
          },
        },{
          label: "Multiple Pickup Charges",
          key: "multiplePickUpCharges",
          sortable: true,
          className: "multiplePickUpCharges",
          compute: function(record){
            if(record.defaultTripRatesDto.multiplePickUpCharges){
              return record.defaultTripRatesDto.multiplePickUpCharges;
            }
          }
        }, {
          label: "Multiple Delivery Charges",
          key: "multipleDeliveryCharges",
          sortable: true,
          className: "multipleDeliveryCharges",
          compute: function(record){
            if(record.defaultTripRatesDto.multipleDeliveryCharges){
              return record.defaultTripRatesDto.multipleDeliveryCharges;
            }
          }
        }, {
          label: "Other Charges",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.otherCharges) && isChanged(record.defaultTripRatesDto.otherCharges , record.updatedTripRatesDto.otherCharges)) {
              return truncateValue(record.updatedTripRatesDto.otherCharges);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.otherCharges)) {
              return truncateValue(record.defaultTripRatesDto.otherCharges);
            }
            return "0.00";
          },
          className: "otherCharges",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.otherCharges) && isChanged(record.defaultTripRatesDto.otherCharges , record.updatedTripRatesDto.otherCharges)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.otherCharges) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.otherCharges) + '</div>';
            }
            return truncateValue(value);
          },
        }, {
          label: "Invoice amount",
          compute: function(record) {
            record.invoiceAmount = 0;
            invoiceBreakupComponents.forEach(function(comp) {
              if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto[comp]) && isChanged(record.defaultTripRatesDto[comp] , record.updatedTripRatesDto[comp])) {
                record.invoiceAmount += record.updatedTripRatesDto[comp];
              } else if(record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto[comp])) {
                record.invoiceAmount += record.defaultTripRatesDto[comp];
              }
            });
            return truncateValue(record.invoiceAmount);
          },
          className: "amount",
          showDownArrow: true
        }, {
          label: "Comments",
          key: "comments",
          className: "commentsBlock",
          editable: function(record) {
            return record.selected;
          },
          show: function() {
            return true;
          },
          editArgs: {
            editType: "text",
            ngModel: "comments"
          },
          showHover: function(record) {
            if (record && hasValue(record.comments)) {
              return true;
            }
          },
          hover: {
            templateFn: function(record) {
              var templ = "<div class='updatedTripRatesDtoHover'>";
              templ += '<div><div class = "value">' + record.comments + '</div></div>';
              templ +='</div>';
              return templ;
            }
          }
        }],
        actions: [{
          label: "Edit",
          action: function(record) {
            $rootScope.$emit('show-topDrawer', {
      				template: 'views/dialogs/editTripCost.html',
      				controller: 'EditTripCostController',
              successCallback: function() {
                $rootScope.$emit('load-start');
                $scope.filter();
              //  $rootScope.$emit('load-stop');
              },
              data: {
                tripData: record
              },
      				heading: "Change trip rate details"
      			});
          },
          show: function(record) {
            return $scope.tabSelected === "PENDING" && $scope.UserProfile.$hasAnyRole($scope.PermissionConstant.editTripRate);
            //record.tripBillingSplitType !== "SPLITTED" 
          }
        },{
          label: "Delays",
          action: function(record){
            $rootScope.$emit('show-topDrawer',{
              template:  'views/dialogs/detentionDetails.html',
              controller: 'DetentionDetailsController',
              successCallback: function(){
                $rootScope.$emit('load-start');
                $scope.filter();
              },
              data:{
                detentionData: record
              },
              heading: "Loading and unloading delays"
            });
          },
          show: function(record) {
            return $scope.tabSelected === "PENDING" && $scope.UserProfile.$hasAnyRole($scope.PermissionConstant.editTripRate);
          }
        }],
        selectable: true
      };

      $scope.invoiceTableData = commonInvoiceTableData;

      function askApproval() {
        var dialog = ngDialog.open({
            templateUrl: 'views/dialogs/dialogConfirm.html',
            appendClassName: 'dialogConfirm',
            scope: $scope,
            closeByDocument: false,
            showClose: false
          });
          dialog.closePromise.then(function (data) {
            if(data.value==='true'){
              var trips = {
              clientId: $scope.filters.client.id,
              tripBillingDetailDtoList: []
              };
              $scope.selectedTrips.forEach(function(t) {
                trips.tripBillingDetailDtoList.push({
                  id: t.id,
                  routeBillingId: t.clientRouteBillingId
                });
              });
              var userName = $scope.UserProfile.user_name;
              InvoiceService.askBDApprovalforPendingTrips(trips,userName).then(function() {
                $scope.filter();
              }, function() {
                console.log("Unsuccessful");
              });
            }
          });
      }

      function approveOrReject(approved) {
        var trips = {
          bdApprovalTripDtoList: []
        };
        $scope.selectedTrips.forEach(function(t) {
          trips.bdApprovalTripDtoList.push({
            id: t.id,
            comments: t.comments,
            approved: approved
          });
        });
        var userName = $scope.UserProfile.user_name;
        InvoiceService.approveOrRejectPendingTrips(trips,userName).then(function() {
          console.log("Successful");
          $scope.filter();
        }, function() {
          console.log("Unsuccessful");
        });
      }

      function showEnterCommentDialog() {
        if($scope.selectedTrips && $scope.selectedTrips.length > 0) {
          var dialog = ngDialog.open({
            templateUrl: 'views/dialogs/enterCommentReject.html',
            appendClassName: 'enterComment',
            scope: $scope,
            closeByDocument: false,
            showClose: false
          });
          dialog.closePromise.then(function (data) {
            if(data.value) {
              $scope.selectedTrips.forEach(function(t) {                
                t.comments = data.value;
              });
              approveOrReject(false);             
            }
          });
        }
      }

      function showFuelSurchargeDialog() {
        if($scope.selectedTrips && $scope.selectedTrips.length > 0) {
          var dialog = ngDialog.open({
            templateUrl: 'views/dialogs/calculateFuelSurcharge.html',
            appendClassName: 'fuelSurchargeDialog',
            scope: $scope,
            closeByDocument: false,
            showClose: false
          });
          dialog.closePromise.then(function (data) {
            if(data.value) {
              var currentFuelRate = data.value, clientId = $scope.filters.client.id, trips = [];
              $scope.selectedTrips.forEach(function(o) {
                trips.push({
                  tripBillingId: o.id,
                  routeBillingId: o.clientRouteBillingId
                });
              });
              $rootScope.$emit('load-start');
              var userName = $scope.UserProfile.user_name;
              InvoiceService.calculateFuelSurcharge(clientId, currentFuelRate, trips, userName).then(function() {
                $scope.filter();
              }, function() {
                $scope.amount = "Invalid Input";
                var dialogConfirm = ngDialog.open({
                  templateUrl: 'views/dialogs/showFuelSurcharge.html',  
                  appendClassName: 'detailsValue',
                  scope : $scope,
                });
                $rootScope.$emit('load-stop');
                console.log('Unable to compute');
              });
            }
          });
        }
        else{
          $scope.amount = "No Invoice Selected.";
          var dialogConfirm = ngDialog.open({
            templateUrl: 'views/dialogs/showFuelSurcharge.html',  
            appendClassName: 'detailsValue',
            scope : $scope,
          });
          $rootScope.$emit('load-stop');
          console.log('Unable to compute');
        }
      }

      function unassignedCurrentRateListCreation() {
        var unassignedCurrentRateList = [];
        if($scope.selectedTrips && $scope.selectedTrips.length > 0) {
              $scope.selectedTrips.forEach(function(obj){
                unassignedCurrentRateList.push(obj.id);
              });
              var new_planning_id_obj = {};
              new_planning_id_obj.planningIdList = unassignedCurrentRateList;
              $rootScope.$emit('load-start');
              var userName = $scope.UserProfile.user_name;
              InvoiceService.unassignedCurrentRate(new_planning_id_obj,userName).then(function() {
                  $rootScope.$emit('load-stop');
                  $scope.filter();
                  $scope.selectedTrips = [];
                  $scope.selectAll = false;
              }, function() {
                $rootScope.$emit('load-stop');
                console.log('Unable to update unassigned current rate');
              });
            }
          }
          function computeRateByWeight() {
            if($scope.selectedTrips && $scope.selectedTrips.length > 0) {
              var dialog = ngDialog.open({
                templateUrl: 'views/dialogs/calculateRateByWeight.html',
                appendClassName: 'rateByWeightDailog',
                scope: $scope,
                closeByDocument: false,
                showClose: false
              });
              dialog.closePromise.then(function (data) {
                if(data.value) {
                  var currentWeight = data.value, clientId = $scope.filters.client.id, trips = [];
                  $scope.selectedTrips.forEach(function(o) {
                    trips.push({
                      tripBillingId: o.id,
                      routeBillingId: o.clientRouteBillingId
                    });
                  });
                  $rootScope.$emit('load-start');
                  var userName = $scope.UserProfile.user_name;
                  InvoiceService.calculateRateByWeight(clientId, currentWeight, trips ,userName).then(function() {
                    $rootScope.$emit('load-stop');
                    $scope.filter();
                  }, function() {
                      $rootScope.$emit('load-stop');
                      $scope.message = "Invalid Input";
                      var dialogConfirm = ngDialog.open({
                        templateUrl: 'views/dialogs/errorDialog.html',  
                        appendClassName: 'detailsValue',
                        scope : $scope,
                      });
                      console.log('Unable to compute');
                    }
                  );
                }
              });
            }
            else{
              $scope.message = "No Invoice Selected.";
              var dialogConfirm = ngDialog.open({
                templateUrl: 'views/dialogs/errorDialog.html',  
                appendClassName: 'detailsValue',
                scope : $scope,
              });
            }
          }
          

      function showComputeTotalDialog() {
        if($scope.selectedTrips && $scope.selectedTrips.length > 0) {

          var computeTotalObj = {
            baseRate: 0,
            fuelSurcharge: 0,
            loadingDetention: 0,
            unloadingDetention: 0,
            lateCharge: 0,
            loading: 0,
            unloading: 0,
            greenTax: 0,
            otherCharges: 0,
            invoiceAmount: 0
          };

          $scope.totals = {};

          $scope.selectedTrips.forEach(function(record) {
            invoiceBreakupComponents.forEach(function(comp) {
              if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto[comp]) && isChanged(record.defaultTripRatesDto[comp] , record.updatedTripRatesDto[comp])) {
                computeTotalObj[comp] += +record.updatedTripRatesDto[comp];
              } else if(record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto[comp])) {
                computeTotalObj[comp] += +record.defaultTripRatesDto[comp];
              }
            });
            computeTotalObj.invoiceAmount += +record.invoiceAmount;
          });

          $scope.totals.computeTotalObj = computeTotalObj;

          ngDialog.open({
            templateUrl: 'views/dialogs/calculateTotalAmount.html',
            appendClassName: 'fuelSurchargeDialog',
            scope: $scope,
            closeByDocument: false,
            showClose: false
          });
        }
        else{
          $scope.message = "No Invoice Selected.";
          var dialogConfirm = ngDialog.open({
            templateUrl: 'views/dialogs/errorDialog.html',  
            appendClassName: 'detailsValue',
            scope : $scope,
          });
        $rootScope.$emit('load-stop');
        console.log('Unable to compute');
        }
      }
      function showInvoiceGenerationDialog() {
        if($scope.selectedTrips && $scope.selectedTrips.length > 0) {
          $rootScope.$emit('show-topDrawer', {
    				template: 'views/dialogs/invoiceGeneration.html',
    				controller: 'InvoiceGeneration',
            data: {
              client: $scope.filters.client,
              selectedTrips: $scope.selectedTrips
            },
            heading: "Generate invoice",
            successCallback: function() {
              $scope.filter();
            }
    			});
        }
      }
      function updateClientRoute() {
        TripBillingDetailService.updateClientRoute($scope.filters.client.id).then(function(res) {
          $scope.message = "Updated Successfully!";
          var dialogConfirm = ngDialog.open({
            templateUrl: 'views/dialogs/errorDialog.html',  
            appendClassName: 'detailsValue',
            scope : $scope,
          });
        }, function() {
          $scope.message = "Could not Update";
          var dialogConfirm = ngDialog.open({
            templateUrl: 'views/dialogs/errorDialog.html',  
            appendClassName: 'detailsValue',
            scope : $scope,
          });
        });
      }
      function showSplitByCategoryDialog() {
        if($scope.selectedTrips && $scope.selectedTrips.length > 0) {  
          $scope.categories =[{ name: "Base Rate", value: "baseRate", ticked: false },
                              { name: "Fuel Surcharge", value: "fuelSurcharge", ticked: false },
                              { name: "Loading Charges", value: "loading", ticked: false  },
                              { name: "Unloading Charges", value: "unloading", ticked: false },
                              { name: "Late Charges", value: "lateCharge", ticked: false  },
                              { name: "Green Tax", value: "greenTax", ticked: false },
                              { name: "Other Charges", value: "otherCharges", ticked: false  },
                              { name: "Loading Detention", value: "loadingDetention", ticked: false  },
                              { name: "Unloading Detention", value: "unloadingDetention", ticked: false  },
                            ];

          $rootScope.$emit('show-topDrawer', {
            template: 'views/dialogs/splitByCategory.html',
            controller: 'SplitByCategory',
            data: {
              client: $scope.filters.client,
              selectedTrips: $scope.selectedTrips,
              categories: $scope.categories
            },
            heading: "Split selected invoices in categories",
            successCallback: function() {
              $scope.filter();
            }
          });
        }
      }

      $rootScope.$on('refresh-trips', function() {
        $scope.filter();
      });

      var globalButtons = [{
          label: "Generate invoice",
          show: function() {
          return $scope.tabSelected === "APPROVED" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.generateInvoice));
        },
        action: showInvoiceGenerationDialog
      }, {
        label: "Split in Categories",
        show: function() {
          return $scope.tabSelected === "APPROVED" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.splitInCategory));
        },
        action: showSplitByCategoryDialog
      }, {
        label: "Ask for approval",
        show: function() {
          return $scope.tabSelected === "PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.editTripRate));
        },
        action: askApproval
      }, {
        label: "Compute fuel surcharge",
        show: function() {
          return $scope.tabSelected === "PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.fuelSurchargeCaluculation));
        },
        action: showFuelSurchargeDialog
      }, {
        label: "Approve",
        show: function() {
          return $scope.tabSelected === "APPROVAL_PENDING" && (
            ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.approveBDOperation)));
        },
        action: approveOrReject.bind({}, true)
      }, {
        label: "Unassign current rate",
        show : function() {
          return $scope.tabSelected === "PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.fuelSurchargeCaluculation));
        },
        action: unassignedCurrentRateListCreation
      }, {
        label: "Compute rate by weight/kilometer",
        show : function() {
          return $scope.tabSelected === "PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.fuelSurchargeCaluculation));
        },
        action: computeRateByWeight
      }, {
        label: "Reject",
        show: function() {
          return ($scope.tabSelected === "APPROVAL_PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.rejectBDOperation))) || ($scope.tabSelected === "APPROVAL_PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.rejectFinanceHead)) ) || ($scope.tabSelected === "APPROVED" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.rejectFinanceHead)) );
        //  ($scope.tabSelected === "BD_APPROVED" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.rejectBDInvoice)));
        },
        action: showEnterCommentDialog
      }, {
        label: "Compute total",
        show : function() {
          return true;
        },
        action: showComputeTotalDialog
      }, {
          label: "Update Client Route",
          show: function() {
          return $scope.tabSelected === "PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.generateInvoice));
        },
        action: updateClientRoute
      }];

      var tabTableData = {
        "APPROVAL_PENDING": {
          hideActions: true
        }
      };

      $scope.selectAll = false;

      function setTabData() {
        var tab = $scope.tabSelected;
        $scope.invoiceTableData = {};
        $scope.selectedTrips = [];
        $scope.selectAll = false;
        angular.extend($scope.invoiceTableData, commonInvoiceTableData, tabTableData[tab]);
        var trips = [];
        if ($scope.showEvents.length  > 0) {
          $scope.showEvents.forEach(function(obj) {
            if(tab === "PENDING" && (obj.tripBillingStatus === "PENDING" || obj.tripBillingStatus === "PENDING_WITH_BD_REJECTED")) {
              trips.push(obj);
            } else if(tab === "APPROVAL_PENDING" && obj.tripBillingStatus === "ANNEXURE_CREATED") {
              trips.push(obj);
            } else if(tab === "APPROVED" && obj.tripBillingStatus === "BD_APPROVED") {
              trips.push(obj);
            }
          });
        }
        $scope.tripsData = trips;
      }

      $scope.tabClicked = function(tab) {
        if($scope.tabSelected && $scope.tabSelected === tab) {
          return;
        }
        $scope.tabSelected = tab;
        setTabData();
      };

      $scope.$watch('tabSelected', function() {
        var buttons = [], getType = {};
        globalButtons.forEach(function(o) {
          if(o.show && getType.toString.call(o.show) === '[object Function]') {
            if(!o.show.call({})) {
              return;
            }
          }
          buttons.push(o);
        });
        $scope.buttons = buttons;
      });

      $scope.onClientSelect = function() {
        $scope.startCWH = "";
        $scope.clientRouteId = "";
        ClientService.getClientRoutes($scope.filters.client.id).then(function(res) {
          $scope.clientRoutes = res;
          res.forEach(function(obj) {
            obj.displayName = obj.clientRouteName + " (" + obj.routeName + ")";
          });
          console.log(res);
        }, function() {
          console.log("Could not fetch routes");
        });
        ClientService.getClientWarehouses($scope.filters.client.id).then(function(res) {
          $scope.clientCWHs = res;
          console.log(res);
        }, function() {
          console.log("Could not fetch warehouses");
        });
      };

      $scope.filter = function() {
        var clientId = $scope.filters.client.id,
          clientRoutes = $scope.filters.clientRoutes,
          startCWHs = $scope.filters.startCWHs,
          endCWHs = $scope.filters.endCWHs,
          startDate, endDate, dateFilterType,clientRouteIds = [], startCWHIds = [], endCWHIds = [];



        var filters = [];
        if(clientId) {
          filters.push({
            label: "Client",
            values: [$scope.filters.client.clientName]
          });
        }
        if(clientRoutes && clientRoutes.length > 0) {
          var routeValues = [];
          clientRoutes.forEach(function(o) {
            if(o.ticked) {
              clientRouteIds.push(o.id);
              routeValues.push(o.displayName);
            }
          });
          filters.push({
            label: "Route",
            values: routeValues
          });
        }
        if(startCWHs && startCWHs.length > 0) {
          var startValues = [];
          startCWHs.forEach(function(o) {
            if(o.startSelected) {
              startCWHIds.push(o.id);
              startValues.push(o.name);
            }
          });
          filters.push({
            label: "Starting",
            values: startValues
          });
        }
        if(endCWHs && endCWHs.length > 0) {
          var endValues = [];
          endCWHs.forEach(function(o) {
            if(o.endSelected) {
              endCWHIds.push(o.id);
              endValues.push(o.name);
            }
          });
          filters.push({
            label: "Ending",
            values: endValues
          });
        }

        if($scope.filters.dateFilter) {
          dateFilterType = $scope.filters.tripDatesFilter;
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

        $scope.filterValues = filters;
        $scope.headOpen = false;
        $rootScope.$emit('load-start');
        console.log(clientId);
        console.log(clientRouteIds);
        console.log(startCWHIds);
        console.log(endCWHIds);
        InvoiceService.getTripsPendingInvoicing(clientId, clientRouteIds, startCWHIds, endCWHIds, dateFilterType, startDate, endDate).then(function(response) {
          $scope.pendingTrips = response.object;
          $scope.grouping($scope.groupFilter);

          $scope.pendingTrips.forEach(function(obj){
            if(obj.detentionDetailDto && obj.detentionDetailDto.delayDataDtoList && 
              obj.detentionDetailDto.delayDataDtoList[0].cwhId == obj.endPoint ){
              var tmp = obj.detentionDetailDto.delayDataDtoList[0];
              obj.detentionDetailDto.delayDataDtoList[0] = obj.detentionDetailDto.delayDataDtoList[1];
              obj.detentionDetailDto.delayDataDtoList[1] = tmp;
            }
          });
          //$scope.groupFilter = "all";
          //$scope.grouping($scope.groupFilter);
          //setTabData();
          $rootScope.$emit('load-stop');
        }, function() {
          $rootScope.$emit('load-stop');
        });
      };


      $scope.grouping = function(selection) {
        $scope.groupFilter = selection;
        if (selection === "all") {
          $scope.showEvents = $scope.pendingTrips;
        } else if (selection === "not_null") {
          var notNullArray = [];
          $scope.pendingTrips.forEach(function(obj){
            if (obj.clientRouteBillingId) {
              notNullArray.push(obj);
            }
          });
          $scope.showEvents = notNullArray;
        } else if (selection === "null") {
          var nullArray = [];
          $scope.pendingTrips.forEach(function(obj){
            if (!obj.clientRouteBillingId) {
              nullArray.push(obj);
            }
          });
          $scope.showEvents = nullArray;
        }
        setTabData();
      };
      
      $scope.uploadTripsCSV = function(){    
        $rootScope.$emit('show-topDrawer', {
          template: 'views/dialogs/UploadCsv.html',
          controller: 'UploadCsvCtrl',
          heading: "Upload CSV",
          type: "invoiceTripUpload"
        });
      }

      $scope.downloadTripsCSV = function() {
        //alert("hi");
        var csvName = $scope.filters.client.clientName;
        var extraColumns = [
        {
          label: "Vehicle number",
          key: "vehicleNumber"
        }, {
          label:"Trip type",
          key:"tripType"

        }, {
          label: "Trip start time",
          key: "startTime",
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy');
          }
        }, {
          label: "Trip end time",
          key: "endTime",
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy');
          }
        },{
          label: "Start cwh in time",
          key: "detentionDetailDto.delayDataDtoList",
          formatter: function(value) {
            if(value && value.length > 0 ){
             return $filter('date')(value[0].manualCwhInTime, 'dd/MM/yyyy HH:mm');
          }
          }
        },{
          label: "Start cwh out time",
          key: "detentionDetailDto.delayDataDtoList",
          formatter: function(value) {
            if(value && value.length > 0){
              return $filter('date')(value[0].manualCwhOutTime, 'dd/MM/yyyy HH:mm');
            }
          }
        },{
          label: "Start cwh delay",
          key: "detentionDetailDto.delayDataDtoList",
          formatter: function(value)  {
            if(value && value.length > 0){
              return value[0].delay;
            }
          }
        },{
          label: "End cwh in time",
          key: "detentionDetailDto.delayDataDtoList",
          formatter: function(value) {
            if(value && value.length > 1 ){
              return $filter('date')(value[1].manualCwhInTime, 'dd/MM/yyyy HH:mm');
            }
          }
        },{
          label: "End cwh out time",
          key: "detentionDetailDto.delayDataDtoList",
          formatter: function(value){
            if(value && value.length > 1){
              return $filter('date')(value[1].manualCwhOutTime, 'dd/MM/yyyy HH:mm');
            }
          }
        },{
          label: "End cwh delay",
          key: "detentionDetailDto.delayDataDtoList",
          formatter: function(value){
            if(value && value.length > 1){
              return value[1].delay;
            }
          }
        },{
          label: "Current fuel rate",
          key: "defaultTripRatesDto.currentFuelRate",
          formatter: function(value) {
            if(value){
                return truncateValue(value);
            }
          }
        },{
          label: "Fuel surcharge type",
          key: "clientRouteFuelDetailDto.fuelSurchargeType",
          formatter: function(value) {
            if(value){
                return truncateValue(value);
            }
          }
        },{
          label: "Fuel base rate",
          key: "clientRouteFuelDetailDto.fuelBaseRate",
          formatter: function(value) {
            if(value){
                return truncateValue(value);
            }
          }
        },{
          label: "Applicable above",
          key: "clientRouteFuelDetailDto.applicableAbove",
          formatter: function(value) {
            if(value){
                return truncateValue(value);
            }
          }
        },{
          label: "Consideration part",
          key: "clientRouteFuelDetailDto.considerationPart",
          formatter: function(value) {
            if(value){
              return truncateValue(value);
            }
          }
        },{
          label: "Fuel rate change type",
          key: "clientRouteFuelDetailDto.fuelRateChangeType",
          formatter: function(value) {
            if(value){
                return value;
            }
          }
        },{
          label: "Base value",
          key: "clientRouteFuelDetailDto.baseValue",
          formatter: function(value) {
            if(value){
                return truncateValue(value);
            }
          }
        }, {
          label: "Freight Rate",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.baseRate) && isChanged(record.defaultTripRatesDto.baseRate , record.updatedTripRatesDto.baseRate)) {
              return truncateValue(record.updatedTripRatesDto.baseRate);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.baseRate)) {
              return truncateValue(record.defaultTripRatesDto.baseRate);
            }
            return "0.00";
          },
          className: "baseRate"
        }, {
          label: "Fuel Adjustment",
          className: "fuelSurcharge",
          showDownArrow: true,
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.fuelSurcharge) && isChanged(record.defaultTripRatesDto.fuelSurcharge , record.updatedTripRatesDto.fuelSurcharge)) {
              return truncateValue(record.updatedTripRatesDto.fuelSurcharge);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.fuelSurcharge)) {
              return truncateValue(record.defaultTripRatesDto.fuelSurcharge);
            }
            return "0.00";
          },
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.fuelSurcharge) && isChanged(record.defaultTripRatesDto.fuelSurcharge , record.updatedTripRatesDto.fuelSurcharge)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.fuelSurcharge) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.fuelSurcharge) + '</div>';
            }
            return truncateValue(value);
          },
          showHover: true,
          hover:{
            templateFn: function(record){
              var templ = "<div class = 'clientRouteFuelDetail'>";
              if(record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.currentFuelRate)){
                templ += '<div><div class="title">Current fuel rate : </div><div class = "value">' + record.defaultTripRatesDto.currentFuelRate + '</div></div>';
              }
              if(record.clientRouteFuelDetailDto){
                var tmpDto = record.clientRouteFuelDetailDto;
                if(hasValue(tmpDto.fuelSurchargeType)){
                  templ+= '<div><div class="title">Fuel surcharge type: </div><div class="value">' + tmpDto.fuelSurchargeType +  '</div></div>';
                }
                if(hasValue(tmpDto.fuelBaseRate)){
                  templ+= '<div><div class="title">Fuel base rate: </div><div class="value">' + tmpDto.fuelBaseRate +  '</div></div>';
                }
                if(hasValue(tmpDto.applicableAbove)){
                  templ+= '<div><div class="title">Applicable above: </div><div class="value">' + tmpDto.applicableAbove +  '</div></div>';
                }
                if(hasValue(tmpDto.considerationPart)){
                  templ+= '<div><div class="title">Consideration part: </div><div class="value">' + tmpDto.considerationPart +  '</div></div>';
                }
                if(hasValue(tmpDto.fuelRateChangeType)){
                  templ+= '<div><div class="title">Fuel rate change type: </div><div class="value">' + tmpDto.fuelRateChangeType +  '</div></div>';
                }
                if(hasValue(tmpDto.baseValue)){
                  templ+= '<div><div class="title">Base value: </div><div class="value">' + tmpDto.baseValue +  '</div></div>';
                }
                if(hasValue(tmpDto.mileage)){
                  templ+= '<div><div class="title">Mileage: </div><div class="value">' + tmpDto.mileage +  '</div></div>';
                  templ+= '<div><div class="title">Total distance: </div><div class="value">' + tmpDto.totalDistance +  '</div></div>';
                }
                return templ;
              }
            }
          },
        }, {
          label: "Loading charges",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.loading) && isChanged(record.defaultTripRatesDto.loading , record.updatedTripRatesDto.loading)) {
              return truncateValue(record.updatedTripRatesDto.loading);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.loading)) {
              return truncateValue(record.defaultTripRatesDto.loading);
            }
            return "0.00";
          },
          className: "loadingRate",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.loading) && isChanged(record.defaultTripRatesDto.loading , record.updatedTripRatesDto.loading)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.loadingRate) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.loading) + '</div>';
            }
            return truncateValue(value);
          },
        }, {
          label: "Unloading charges",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.unloading) && isChanged(record.defaultTripRatesDto.unloading , record.updatedTripRatesDto.unloading)) {
              return truncateValue(record.updatedTripRatesDto.unloading);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.unloading)) {
              return truncateValue(record.defaultTripRatesDto.unloading);
            }
            return "0.00";
          },
          className: "unloadingRate",
          showDownArrow: true,
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.unloading) && isChanged(record.defaultTripRatesDto.unloading , record.updatedTripRatesDto.unloading)) {
              return '<strike>'+ truncateValue(record.defaultTripRatesDto.unloading) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.unloading) + '</div>';
            }
            return truncateValue(value);
          },
        },{
          label: "Edited(Y/N)"
        }];


        extraColumns = $scope.invoiceTableData.columns.concat(extraColumns);
        $scope.vehicleTypeModifyValue = "";
        //var vehicleType = "";
        $scope.tripsData.forEach(function(o,i) {
          
          
          if(o.vehicleType){
               var result = o.vehicleType.split('_');
               $scope.vehicleTypeModifyValue = result[1];
               //console.log($scope.vehicleTypeModifyValue);
            }
            
            $scope.tripsData[i].vehicleType=$scope.vehicleTypeModifyValue;
        });
        //console.log($scope.tripsData);
        $rootScope.JSONToCSVConvertor($scope.tripsData, csvName, extraColumns);

      };

      $scope.selectedTrips = [];

    }
  ]);
