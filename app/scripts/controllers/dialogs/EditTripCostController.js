'use strict';

angular.module('financeUiApp')
  .controller('EditTripCostController', ['$rootScope', '$scope', 'InvoiceService', 'UserProfileFactory', 'PermissionConstant',
    function($rootScope, $scope, InvoiceService, UserProfileFactory, PermissionConstant) {

      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      function hasValue(a) {
        return a || a === 0;
      }

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

      if ($scope.globalData && $scope.globalData.tripData) {
        $scope.tripData = $scope.globalData.tripData;
        $scope.rateComponents.forEach(function(obj) {
          if ($scope.tripData.updatedTripRatesDto && hasValue($scope.tripData.updatedTripRatesDto[obj.key])) {
            obj.editedValue = $scope.tripData.updatedTripRatesDto[obj.key];
            obj.isEdit = true;
          } else {
            obj.editedValue = $scope.tripData.defaultTripRatesDto[obj.key];
          }
        });
      }

      $scope.showTooltip = function(ev, text) {
        ev.preventDefault();
        var args = {
          top: ev.clientY + "px",
          left: ev.clientX + "px",
          template: '<div class="width150Fixed">' + text + '</div>'
        };
        $rootScope.$emit('show-tooltip', args);
      };

      $scope.hideTooltip = function(ev) {
        ev.preventDefault();
        $rootScope.$emit('hide-tooltip');
      };

      // data is final split data array and times is the ratio array in which you want to divide

      function splitData(data, times) {
        var invoiceData = $scope.tripData,
          j, i, rateComponent, value, timesLength = times.length,
          totalShare = 0;
        if (data.length !== timesLength) {
          if (data.length > timesLength) {
            for (i = timesLength; i < data.length; i++) {
              delete data[i];
            }
          } else {
            for (i = data.length; i < timesLength; i++) {
              data[i] = {};
            }
          }
        }
        times.forEach(function(t) {
          totalShare += +t;
        });
        $scope.tripData.totalSharesWeight = totalShare;
        for (i = 0; i < timesLength - 1; i++) {
          for (j = 0; j < $scope.rateComponents.length; j++) {
            rateComponent = $scope.rateComponents[j];
            value = rateComponent.isEdit ? rateComponent.editedValue : invoiceData.defaultTripRatesDto[rateComponent.key];
            if (value) {
              data[i][rateComponent.key] = Math.floor(value * times[i] / totalShare * 100) / 100;
            }
          }
        }
        var sum = 0;
        for (j = 0; j < $scope.rateComponents.length; j++) {
          rateComponent = $scope.rateComponents[j];
          value = rateComponent.isEdit ? rateComponent.editedValue : invoiceData.defaultTripRatesDto[rateComponent.key];
          if (value) {
            sum = 0;
            for (i = 0; i < timesLength - 1 ; i++) {
              sum += data[i][rateComponent.key];
              sum = Math.floor(sum * 100) / 100;
            }
            data[i][rateComponent.key] = Math.floor((value - sum) * 100) / 100;
          }
        }

        return data;
      }

      function splitDataByShares() {
        var times = [];
        $scope.splitInvoiceData.forEach(function(o) {
          if (!o.weight) {
            o.weight = 0;
          }
          times.push(+o.weight);
        });

        splitData($scope.splitInvoiceData, times);
        // $rootScope.$emit('render-table');
      }

      $scope.splitInvoiceTableData = {
        columns: [{
            label: "Shares",
            key: "weight",
            className: "weight",
            editable: true,
            editArgs: {
              editType: "number",
              ngModel: "weight",
              onChange: function() {
                splitDataByShares();
                calculateTotal();
              }
            },
            show: function() {
              return $scope.splitDone === 'shares';
            }
          }, {
            label: "Base rate",
            key: "baseRate",
            className: "baseRate",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            },
            editable: function() {
              return $scope.splitDone === 'unequal';
            },
            editArgs: {
              editType: "number",
              ngModel: "baseRate",
              onChange: function() {
                calculateTotal();
              }
            }
          }, {
            label: "Fuel surcharge",
            key: "fuelSurcharge",
            className: "fuelSurcharge",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            },
            editable: function() {
              return $scope.splitDone === 'unequal' || $scope.splitDone === 'shares';
            },
            editArgs: {
              editType: "number",
              ngModel: "fuelSurcharge",
              onChange: function() {
                calculateTotal();
              }
            }
          }, {
            label: "Loading Detention",
            key: "loadingDetention",
            className: "loadingDetention",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            },
            editable: function() {
              return $scope.splitDone === 'unequal' || $scope.splitDone === 'shares';
            },
            editArgs: {
              editType: "number",
              ngModel: "loadingDetention",
              onChange: function() {
                calculateTotal();
              }
            }
          }, {
            label: "Unloading Detention",
            key: "unloadingDetention",
            className: "unloadingDetention",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            },
            editable: function() {
              return $scope.splitDone === 'unequal' || $scope.splitDone === 'shares';
            },
            editArgs: {
              editType: "number",
              ngModel: "unloadingDetention",
              onChange: function() {
                calculateTotal();
              }
            }
          }, {
            label: "Late charge",
            key: "lateCharge",
            className: "detention",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            },
            editable: function() {
              return $scope.splitDone === 'unequal' || $scope.splitDone === 'shares';
            },
            editArgs: {
              editType: "number",
              ngModel: "lateCharge",
              onChange: function() {
                calculateTotal();
              }
            }
          }, {
            label: "Loading",
            key: "loading",
            className: "loadingRate",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            },
            editable: function() {
              return $scope.splitDone === 'unequal' || $scope.splitDone === 'shares';
            },
            editArgs: {
              editType: "number",
              ngModel: "loading",
              onChange: function() {
                calculateTotal();
              }
            }
          }, {
            label: "Unloading",
            key: "unloading",
            className: "unloadingRate",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            },
            editable: function() {
              return $scope.splitDone === 'unequal' || $scope.splitDone === 'shares';
            },
            editArgs: {
              editType: "number",
              ngModel: "unloading",
              onChange: function() {
                calculateTotal();
              }
            }
          }, {
            label: "Green tax",
            key: "greenTax",
            className: "greenTax",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            },
            editable: function() {
              return $scope.splitDone === 'unequal' || $scope.splitDone === 'shares';
            },
            editArgs: {
              editType: "number",
              ngModel: "greenTax",
              onChange: function() {
                calculateTotal();
              }
            }
          }, {
            label: "Other Charges",
            key: "otherCharges",
            className: "otherCharges",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            },
            editable: function() {
              return $scope.splitDone === 'unequal' || $scope.splitDone === 'shares';
            },
            editArgs: {
              editType: "number",
              ngModel: "otherCharges",
              onChange: function() {
                calculateTotal();
              }
            }
          }, {
            label: "Total",
            key: "total",
            className: "total",
            formatter: function(value) {
              if (!value) {
                return 0;
              }
              return value;
            }
          }
          // },
          // editable: function() {
          //   return $scope.splitDone === 'unequal' || $scope.splitDone === 'shares';
          // },
          ////////''

        ],
        hideActions: true
      };

      function checkForCorrectSplitting() {
        var i, j, rateComponent, value, sum;
        for (j = 0; j < $scope.rateComponents.length; j++) {
          rateComponent = $scope.rateComponents[j];
          value = rateComponent.isEdit ? rateComponent.editedValue : $scope.tripData.defaultTripRatesDto[rateComponent.key];
          sum = 0;
          for (i = 0; i < $scope.splitInvoiceData.length; i++) {
            if (!$scope.splitInvoiceData[i][rateComponent.key]) {
              $scope.splitInvoiceData[i][rateComponent.key] = 0;
            }
            sum += Number($scope.splitInvoiceData[i][rateComponent.key]);
          }
          if (sum !== +value && !(sum === 0 && !value)) {
            return false;
          }
        }
        return true;
      }

      $scope.split = function(type) {
        $scope.splitBy = +$scope.splitBy;
        if (!$scope.splitInvoiceData || $scope.splitBy !== $scope.splitInvoiceData.length) {
          $scope.splitInvoiceData = [];
          var splitArray = [];
          for (var i = 0; i < $scope.splitBy; i++) {
            splitArray.push({
              share: 0
            });
          }
          $scope.splitInvoiceData = splitArray;
        }
        if ($scope.splitBy > 1) {
          $scope.splitDone = type;
          $scope.showAlert = false;
          if (type === 'equal') {
            var times = Array($scope.splitBy).fill(1); //  create an array with same value 1 of length splitBy
            splitData($scope.splitInvoiceData, times);
              calculateTotal();
          } else if (type === 'shares') {
            splitDataByShares();
          }
          $rootScope.$emit('render-table');
        } else {
          $scope.alertMessage = "Select a value greater than 1";
          $scope.showAlert = true;
          $scope.splitDone = false;
        }
      };

      function calculateTotal() {
        if ($scope.splitDone) {
          $scope.splitInvoiceData.forEach(function(data) {
            var tot = 0.0;
            if (data.baseRate) {
              tot = tot + parseFloat(data.baseRate);
            }
            if (data.loading) {
              tot = tot + parseFloat(data.loading);
            }
            if (data.unloading) {
              tot = tot + parseFloat(data.unloading);
            }
            if (data.lateCharge) {
              tot = tot + parseFloat(data.lateCharge);
            }
            if (data.fuelSurcharge) {
              tot = tot + parseFloat(data.fuelSurcharge);
            }
            if (data.detention) {
              tot = tot + parseFloat(data.detention);
            }
            if (data.greenTax) {
              tot = tot + parseFloat(data.greenTax);
            }
            if(data.loadingDetention){
              tot = tot + parseFloat(data.loadingDetention);
            }
            if(data.unloadingDetention){
              tot = tot + parseFloat(data.unloadingDetention);
            }
            if(data.otherCharges){
              tot = tot + parseFloat(data.otherCharges);
            }
            data.total = tot.toFixed(3);
          });
          // $rootScope.$emit('render-table');
        }
      };

      $scope.save = function() {
        var editTrip = {}, splitDone=false;
        editTrip.clientTripBillingDetailDto = $scope.tripData;
        editTrip.clientId = $scope.tripData.clientId;
        if ($scope.splitInvoice && $scope.splitDone) {
          splitDone = true;
          if (!checkForCorrectSplitting()) {
            $scope.showAlert = true;
            $scope.alertMessage = "Split values do not add up to the total value.";
            return false;
          }
        }
        if(splitDone){
          editTrip.splitTripRateList = {};
          editTrip.splitTripRateList = $scope.splitInvoiceData;


        }
        editTrip.clientTripBillingDetailDto.tripRateDto = {};
        $scope.rateComponents.forEach(function(o) {
          editTrip.clientTripBillingDetailDto.tripRateDto[o.key] = o.isEdit ? o.editedValue : editTrip.clientTripBillingDetailDto.defaultTripRatesDto[o.key];
        });
        editTrip.clientTripBillingDetailDto.comments = $scope.comments;
        if ($scope.tripData.totalSharesWeight && $scope.splitDone === 'shares') {
          editTrip.clientTripBillingDetailDto.tripRateDto.weight = $scope.tripData.totalSharesWeight;
        }

        var user_name = $scope.UserProfile.user_name;
        return InvoiceService.editTripRates(editTrip,user_name).then(function(res) {
          console.log(res);
          $rootScope.$emit('load-stop');
          return true;
        }, function() {
          $rootScope.$emit('load-stop');
          return false;
        });
      };


    }
  ]);
