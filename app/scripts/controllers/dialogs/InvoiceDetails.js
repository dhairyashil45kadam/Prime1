'use strict';

angular.module('financeUiApp')
  .controller('InvoiceDetails', ['$rootScope', '$scope', 'InvoiceService', '$filter','UserProfileFactory','PermissionConstant','ngDialog',
    function ($rootScope, $scope, InvoiceService, $filter,UserProfileFactory,PermissionConstant,ngDialog) {

      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;
      function isChanged(a, b) {
        return a - b !== 0;
      }

      function truncateValue(a) {
        if(typeof a === "string") {
          a = a.replace(/,/g, '');     //remove , from a formatted value
        }
        return $filter('number')(a, 2);
      }
      
      function hasValue(a) {
        return a || a === 0;
      }
      
      function populateInvoicePreviewDetails() {
        var invoiceDetails = angular.extend({}, $scope.invoice);
        if($scope.invoice.serviceTaxAmount) {
          invoiceDetails.includeTaxes = true;
        }
        invoiceDetails.totalCost = invoiceDetails.invoiceAmount;
        invoiceDetails.address = $scope.invoiceSummary.clientContactDto;
        if(invoiceDetails.address && invoiceDetails.address.address) {
          invoiceDetails.address.addressWithBrTag = invoiceDetails.address.address.replace(/(?:\r\n|\r|\n)/g, '<br />');
        }
        invoiceDetails.invoiceLineItemDtoList = $scope.invoiceSummary.invoiceLineItemDtoList;
        $scope.invoiceDetails = invoiceDetails;
        $scope.downloadTemplateDto = $scope.invoiceSummary.downloadTemplateDto;
        $scope.selectedColumnListToDownload = [];
        var insertingIndex;
        if($scope.downloadTemplateDto !== null){
          $scope.templateName = $scope.downloadTemplateDto.templateName;
          for (var i = 1; i <= Object.keys(JSON.parse($scope.downloadTemplateDto.templateString)).length; i++) {
            var value = JSON.parse($scope.downloadTemplateDto.templateString)[i];
            for (var j = $scope.allColumns.length - 1; j >= 0; j--) {
              if($scope.allColumns[j].label === value) {
                insertingIndex = j;
                break;
              }
            };
            $scope.selectedColumnListToDownload.push(insertingIndex);
          };
        }
        //dummy response to test
        //$scope.selectedColumnListToDownload = [1,2,5,7,11,13,17,19,23,29,31];

        if($scope.selectedColumnListToDownload) {
          for (var i = 0; i <= $scope.selectedColumnListToDownload.length - 1; i++) {
            $scope.recordCheckIndex($scope.selectedColumnListToDownload[i]);
          };
        }
      }

      function populateTripsInfo() {
        $scope.tripsData = $scope.invoiceSummary.tripBillingDetailDtoList;
      }

      $scope.tripsSummaryTable = {
        selectable: false,
        hideActions: true,
        columns: [{
          label: "Trip code",
          key: "tripCode",
          className: "tripCode",
          showHover: true,
          hover: {
            templateFn: function(record) {
              var templ = "<div class='tripDetailsTooltip'>";
              templ += '<div><div class="title">Vehicle No.</div><div class="value">' + record.vehicleNumber + '</div></div>';
              templ += '<div><div class="title">Trip type</div><div class="value">' + record.tripType + '</div></div>';
              templ += '<div><div class="title">Vehicle type</div><div class="value">' + record.vehicleType + '</div></div>';
              templ += '<div><div class="title">Trip start time</div><div class="value">' + $filter('date')(record.startTime, 'dd/MM/yyyy HH:mm') + '</div></div>';
              templ += '<div><div class="title">Trip end time</div><div class="value">' + $filter('date')(record.endTime, 'dd/MM/yyyy HH:mm') + '</div></div>';
              templ += '</div>';
              return templ;
            }
          }
        }, {
          label: "Start point",
          key: "startPointString",
          className: "startPoint"
        }, {
          label: "Touchpoints",
          key: "touchPoints",
          className: "touchPoints",
          formatter: function(value) {
            if(value) {
              value = value.join();
            }
            return value;
          }
        }, {
          label: "End point",
          key: "endPointString",
          className: "endPointString"
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
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.baseRate) && isChanged(record.defaultTripRatesDto.baseRate , record.updatedTripRatesDto.baseRate)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.baseRate) + '</div>';
            }
            return truncateValue(value);
          }
        }, {
          label: "Fuel rate",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.currentFuelRate) && isChanged(record.defaultTripRatesDto.currentFuelRate , record.updatedTripRatesDto.currentFuelRate)) {
              return truncateValue(record.updatedTripRatesDto.currentFuelRate);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.currentFuelRate)) {
              return truncateValue(record.defaultTripRatesDto.currentFuelRate);
            }
            return "0.00";
          },
          className: "currentFuelRate",
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.currentFuelRate) && isChanged(record.defaultTripRatesDto.currentFuelRate , record.updatedTripRatesDto.currentFuelRate)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.currentFuelRate) + '</div>';
            }
            return truncateValue(value);
          }
        }, {
          label: "Fuel surcharge",
          compute: function(record) {
            if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.fuelSurcharge) && isChanged(record.defaultTripRatesDto.fuelSurcharge , record.updatedTripRatesDto.fuelSurcharge)) {
              return truncateValue(record.updatedTripRatesDto.fuelSurcharge);
            } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.fuelSurcharge)) {
              return truncateValue(record.defaultTripRatesDto.fuelSurcharge);
            }
            return "0.00";
          },
          className: "fuelSurcharge",
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.fuelSurcharge) && isChanged(record.defaultTripRatesDto.fuelSurcharge , record.updatedTripRatesDto.fuelSurcharge)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.fuelSurcharge) + '</div>';
            }
            return truncateValue(value);
          }
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
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.loadingDetention) && isChanged(record.defaultTripRatesDto.loadingDetention , record.updatedTripRatesDto.loadingDetention)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.loadingDetention) + '</div>';
            }
            return truncateValue(value);
          }
        }, {
          label: "Unloading detention",
          showHover: true,
          hover: {
            templateFn: function(record) {
              if(record.detentionDetailDto && record.detentionDetailDto.delayDataDtoList){
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
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.unloadingDetention) && isChanged(record.defaultTripRatesDto.unloadingDetention , record.updatedTripRatesDto.unloadingDetention)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.unloadingDetention) + '</div>';
            }
            return truncateValue(value);
          }
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
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.lateCharge) && isChanged(record.defaultTripRatesDto.lateCharge , record.updatedTripRatesDto.lateCharge)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.lateCharge) + '</div>';
            }
            return truncateValue(value);
          }
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
          className: "loading",
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.loading) && isChanged(record.defaultTripRatesDto.loading , record.updatedTripRatesDto.loading)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.loading) + '</div>';
            }
            return truncateValue(value);
          }
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
          className: "unloading",
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.unloading) && isChanged(record.defaultTripRatesDto.unloading , record.updatedTripRatesDto.unloading)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.unloading) + '</div>';
            }
            return truncateValue(value);
          }
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
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.greenTax) && isChanged(record.defaultTripRatesDto.greenTax , record.updatedTripRatesDto.greenTax)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.greenTax) + '</div>';
            }
            return truncateValue(value);
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
          formatter: function(value, record) {
            if(record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.otherCharges) && isChanged(record.defaultTripRatesDto.otherCharges , record.updatedTripRatesDto.otherCharges)) {
              return '<strike>'+ truncateValue(value) +'</strike><div>' + truncateValue(record.updatedTripRatesDto.otherCharges) + '</div>';
            }
            return truncateValue(value);
          }
        }, {
          label: "Invoice Amount",
          className: "otherCharges",
          key : "tripValue"
        }]
      };

      if($scope.globalData && $scope.globalData.invoice) {
        $scope.invoice = $scope.globalData.invoice;
        $rootScope.$emit('load-start');
        InvoiceService.getInvoiceSummary($scope.invoice.invoiceId).then(function(res) {
          $scope.invoiceSummary = res.object;
          populateTripsInfo();
          populateInvoicePreviewDetails();
          $rootScope.$emit('load-stop');
        }, function() {
          $rootScope.$emit('load-stop');
        });
      }

      $scope.steps = [{
        inProgress: true,
        completed: false
      }, {
        inProgress: false,
        completed: false
      }];

      // function showErrorAlert(alert) {
      //   $scope.showAlert = true;
      //   $scope.alertMessage = alert;
      // }

      $scope.changeSelection = function(selectedIndex) {
        $scope.steps.forEach(function(o, index) {
          o.inProgress = index === selectedIndex;
          o.completed = index < selectedIndex;
        });
      };

      $scope.printCover = function() {
        window.print();
      };

      $scope.sortableOptions = {
        stop: function(e, ui) {
          console.log($scope.selectedColumnIndexes);
        }
      };
      $scope.sortingLog = [];
      $scope.selectOptions = function() {
        var dialog = ngDialog.open({
            templateUrl: 'views/dialogs/selectDownloadOptions.html',
            scope: $scope,
            appendClassName: 'selectOptions',
            closeByDocument: false,
            showClose: false
          });
          dialog.closePromise.then(function (data) {
            if(data.value && data.value !== "$escape") {
              var downloadTemplateTemp= {}, k = 0; 
              downloadTemplateTemp.clientId = $scope.invoice.clientId;
              downloadTemplateTemp.templateName = data.value;
              downloadTemplateTemp.templateString = "{";
              for (var i = 1; i <= $scope.selectedColumnIndexes.length; i++) {
                downloadTemplateTemp.templateString += '"'+i+'":"' +$scope.allColumns[$scope.selectedColumnIndexes[i-1]].label+'"';
                if(i !== $scope.selectedColumnIndexes.length)
                  downloadTemplateTemp.templateString += ',';
              };
              downloadTemplateTemp.templateString += "}";
              InvoiceService.createDownloadOptions(downloadTemplateTemp);
            }
          });
      };

      $scope.extraColumns = [
      {
        label: "Trip id",
        key: "id"
      },
      {
        label: "Vehicle type",
        key: "vehicleType",
        formatter: function(value) {
          switch(value) {
            case "TYPE_22" :
              return "22";
            case "TYPE_32" :
              return "32";
            case "TYPE_22_REEFER" :
              return "22 Reefer";
            case "TYPE_32_REEFER" :
              return "32 Reefer";
            case "TYPE_24_REEFER" :
              return "24 Reefer";  
          }
        }
      },
      {
        label: "Trip type",
        key: "tripType"
      },
      {
        label: "Vehicle number",
        key: "vehicleNumber"
      }, {
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
        label: "lr",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.lr)) {
            return truncateValue(record.tripClientDocDto.lr);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "tc",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.tc)) {
            return truncateValue(record.tripClientDocDto.tc);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Weight slip",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.weightSlip)) {
            return truncateValue(record.tripClientDocDto.weightSlip);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Number of bags",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.bagsNum)) {
            return truncateValue(record.tripClientDocDto.bagsNum);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Goods value",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.goodsVal)) {
            return truncateValue(record.tripClientDocDto.goodsVal);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Updated by",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.updatedBy)) {
            return truncateValue(record.tripClientDocDto.updatedBy);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Green time",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.greenTime)) {
            return truncateValue(record.tripClientDocDto.greenTime);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Green user",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.greenUser)) {
            return truncateValue(record.tripClientDocDto.greenUser);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "lr image",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.lrImage)) {
            return truncateValue(record.tripClientDocDto.lrImage);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Gate pass image",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.gatePassImage)) {
            return truncateValue(record.tripClientDocDto.gatePassImage);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "thc image",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.thcImage)) {
            return truncateValue(record.tripClientDocDto.thcImage);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Trip sheet",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.tripsheet)) {
            return truncateValue(record.tripClientDocDto.tripsheet);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Gate pass string",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.gatePassString)) {
            return truncateValue(record.tripClientDocDto.gatePassString);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "thc string",
        compute: function(record) {
          if (record.tripClientDocDto && hasValue(record.tripClientDocDto.thcString)) {
            return truncateValue(record.tripClientDocDto.thcString);
          } else {
            return '0.00';
          }
        }
      }, {
        label: "Weight",
        compute: function(record) {
          if (record.updatedTripRatesDto && hasValue(record.updatedTripRatesDto.weight) && isChanged(record.defaultTripRatesDto.weight , record.updatedTripRatesDto.weight)) {
            return truncateValue(record.updatedTripRatesDto.weight);
          } else if (record.defaultTripRatesDto && hasValue(record.defaultTripRatesDto.weight)) {
            return truncateValue(record.defaultTripRatesDto.weight);
          }
          return "0.00";
        },
      }, {
        label: "Actual time of dispatch",
        key: "startTime",
        formatter: function(value) {
          return $filter('date')(value, 'dd/MM/yyyy');
        }
      }, {
        label: "Actual time of arrival",
        key: "endTime",
        formatter: function(value) {
          return $filter('date')(value, 'dd/MM/yyyy');
        }
      }];

      $scope.allColumns = $scope.tripsSummaryTable.columns.concat($scope.extraColumns);
      $scope.selectedColumnIndexes =  [];

      // $scope.checkAll = function() {
      //   for (var i = 0; i <= $scope.allColumns.length - 1; i++) {
      //     $scope.recordCheckIndex(i);
      //   };
      // }
      //old function
      /*$scope.recordCheckIndex = function(index) {
        var isFound = $scope.selectedColumnIndexes.indexOf(index);
        var str = 'all'+index;
        if(isFound !== -1) {//delete if found
          $scope.selectedColumnIndexes.splice(isFound,1);
          $scope[str] = false;
        }
        else { //insert if not found
          $scope.selectedColumnIndexes.push(index);
          $scope[str] = true;
        }
      };*/

      //function to check all or uncheck all of dowloadable coloumns
      $scope.checkAll = function(value) {
        for (var i = 0; i <= $scope.allColumns.length - 1; i++) {
            if (value) {
              //if value is check all
              $scope.recordCheckIndex(i,'allTrue');  
            }else{
              //if value is uncheck all
              $scope.recordCheckIndex(i,'allFalse');  
            }
            
          };
      }

      $scope.recordCheckIndex = function(index,type) {
        var isFound = $scope.selectedColumnIndexes.indexOf(index);
        var str = 'all'+index;
        if(isFound !== -1) {//delete if found and type != checkall(allTrue)
          if (type != 'allTrue' ) {
            $scope.selectedColumnIndexes.splice(isFound,1);
            $scope[str] = false;
          }  
        }
        else { //insert if not found
          $scope.selectedColumnIndexes.push(index);
          $scope[str] = true;
        }
      };

      //function to download csv
      $scope.downloadInvoice = function () {
        $scope.downloadInvoiceData = [];
        $scope.downloadInvoiceTemplate = [];

        //downloadable csv template
        $scope.invTempl = [
        {"className":"creationDate","key":"creationDate","label":"Creation Date"},
        {"className":"invoiceNumber","key":"invoiceNumber","label":"Invoice Number"},
        {"className":"invoiceAmount","key":"invoiceAmount","label":"Invoice Amount"},
        {"className":"amountInWords","key":"amountInWords","label":"Amount In Words"},
        {"className":"serviceTaxNo","key":"serviceTaxNo","label":"Service Tax No."},
        {"className":"panNo","key":"panNo","label":"PAN No."},
        {"className":"cinNo","key":"cinNo","label":"CIN No."}
        ];
        
        //data to be downloaded
        $scope.downloadInvoiceData.push({"creationDate":$filter('date')($scope.invoiceDetails.creationDate, "dd/MM/yyyy"),"invoiceNumber":$scope.invoiceDetails.invoiceNumber,"invoiceAmount":$scope.invoiceDetails.invoiceAmount,"amountInWords":$scope.invoiceDetails.amountInWords,"serviceTaxNo":"AAFCT0838FSD001","panNo":"AAFCT0838F","cinNo":"U74999HR2014PTC053030"});

        //function to handle multiple line items
        angular.forEach($scope.invoiceDetails.invoiceLineItemDtoList, function(value, key) {
            var itemNo = key+1;
            $scope.downloadInvoiceData[0]["item"+[itemNo]+ "description"] = value.description;
            $scope.invTempl.push({"className":"item"+[itemNo]+ "description","key":"item"+[itemNo]+ "description","label":"Line Item "+itemNo+" Description"});
            $scope.downloadInvoiceData[0]["item"+[itemNo]+ "amount"] = value.amount;
            $scope.invTempl.push({"className":"item"+[itemNo]+ "amount","key":"item"+[itemNo]+ "amount","label":"Line Item "+itemNo+" Amount"});
        });

        var csvName = $scope.invoiceDetails.invoiceNumber + "_" + $scope.invoiceDetails.clientCode;//csvname
        $rootScope.JSONToCSVConvertor($scope.downloadInvoiceData, csvName, $scope.invTempl);//create csv and download
      }


      
      $scope.downloadTripsCSV = function() {
        //$scope.selectedColumnIndexes.sort();
        var selectedCoulumns = [];
        for (var i = 0; i <= $scope.selectedColumnIndexes.length - 1; i++) {
          var tempColumn = $scope.allColumns[$scope.selectedColumnIndexes[i]];
          switch(tempColumn.label) {
            case "Base rate" : 
              tempColumn.label = "Freight Rate";
              break;
            case "Fuel surcharge" : 
              tempColumn.label = "Fuel Adjustment";
              break;
            case "Loading" : 
              tempColumn.label = "Loading charges";
              break;
            case "Unloading" : 
              tempColumn.label = "Unloading charges";
              break;
            case "lr" : 
              tempColumn.label = "LR/ POD No.";
              break;
            case "Actual time of dispatch" : 
              tempColumn.label = "Dispatch Date";
              break;
            case "Actual time of arrival" : 
              tempColumn.label = "Delivery Date";
              break;
          }
          selectedCoulumns.push(tempColumn);
        };
        var csvName = $scope.invoiceDetails.invoiceNumber + "_" + $scope.invoiceDetails.clientCode;
        $rootScope.JSONToCSVConvertor($scope.tripsData, csvName, selectedCoulumns);
      };
    }
  ]);
