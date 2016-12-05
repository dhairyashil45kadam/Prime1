'use strict';

angular.module('financeUiApp').controller('InvoiceGeneration', ['$rootScope', '$scope', 'ClientService', 'InvoiceService','UserProfileFactory','PermissionConstant',
        function($rootScope, $scope, ClientService, InvoiceService,UserProfileFactory,PermissionConstant) {

          $scope.UserProfile = UserProfileFactory.$$state.value;
          $scope.PermissionConstant = PermissionConstant;
            if ($scope.globalData && $scope.globalData.client) {
                $scope.client = $scope.globalData.client;
                $scope.selectedTrips = $scope.globalData.selectedTrips;
            }

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

            function getClientAddress() {
                $rootScope.$emit('load-start');
                ClientService.getBillingAddresses($scope.client.id).then(function(response) {
                    $scope.addresses = response;
                    if ($scope.addresses) {
                        $scope.addresses.forEach(function(obj) {
                            var str = obj.address.replace(/(?:\r\n|\r|\n)/g, '<br />');
                            obj.addressWithBrTag = str;
                        });
                    }
                    $rootScope.$emit('load-stop');
                }, function() {
                    showErrorAlert("Unable to fetch existing addresses");
                });
            }


            getClientAddress();

            $scope.changeSelection = function() {
                $scope.steps = [{
                    inProgress: true,
                    completed: true
                }, {
                    inProgress: false,
                    completed: false
                }];
            };

            $scope.selectedAddressIndex = 0;
            $scope.charges = [];
            $scope.chargeTypeInInvoice = [{
                text: "Fuel surcharge",
                value: "fuelSurcharge",
                id: 1
            }, {
                text: "Loading Detention",
                value: "loadingDetention",
                id: 2
            }, {
                text: "Unloading Detention",
                value: "unloadingDetention",
                id: 3
            }, {
                text: "Late charge",
                value: "lateCharge",
                id: 4
            }, {
                text: "Loading",
                value: "loading",
                id: 5
            }, {
                text: "Unloading",
                value: "unloading",
                id: 6
            }, {
                text: "Green tax",
                value: "greenTax",
                id: 7
            }, {
                text: "Other Charges",
                value: "otherCharges",
                id: 8
            }];

            $scope.selectAddress = function(index) {
                $scope.selectedAddressIndex = index;
            };

            $scope.addAdditionalCharges = function() {
                var trips = $scope.selectedTrips;
                var numOfTrips = $scope.selectedTrips.length;
                var idx,index, transportationCost = 0;
                var transportationObj = {};
                if ($scope.invoiceDetails.invoiceLineItemDtoList.length > 0) {
                    idx = _.findIndex($scope.invoiceDetails.invoiceLineItemDtoList, function(obj) {
                        return obj.id === 0;
                    });
                    transportationObj = $scope.invoiceDetails.invoiceLineItemDtoList[idx];

                }
                $scope.invoiceDetails.invoiceLineItemDtoList.forEach(function(obj) {
                    transportationCost += obj.amount;
                });


                if ($scope.charges.length > 0 && numOfTrips > 0) {
                  $scope.invoiceDetails.invoiceLineItemDtoList.splice(idx,1);
                    $scope.charges.forEach(function(obj) {
                        var sum = 0;
                        for (var i = 0; i < numOfTrips; i++) {
                            if (trips[i].defaultTripRatesDto && trips[i].defaultTripRatesDto[obj.value]) {
                                sum += trips[i].defaultTripRatesDto[obj.value];
                            } else if (trips[i].updatedTripRatesDto && trips[i].updatedTripRatesDto[obj.value]) {
                                sum += trips[i].updatedTripRatesDto[obj.value];
                            }
                        }
                        var amountObj = {};
                        amountObj.description = obj.text + " charges";
                        amountObj.amount = sum;
                        amountObj.id = obj.id;

                        if (amountObj) {
                          transportationCost = transportationCost - sum;
                          index = _.findIndex($scope.invoiceDetails.invoiceLineItemDtoList, function(dtoObj) {
                              return dtoObj.id === amountObj.id;
                          });
                          if(index === -1  ) {
                            $scope.invoiceDetails.invoiceLineItemDtoList.push(amountObj);
                          }
                        }
                    });
                    transportationObj.amount = transportationCost;
                    $scope.invoiceDetails.invoiceLineItemDtoList.unshift(transportationObj);
                } else {
                    if ($scope.invoiceDetails.invoiceLineItemDtoList.length > 1) {
                        var arr = [];
                        $scope.invoiceDetails.invoiceLineItemDtoList.forEach(function(item) {
                            if (item.id === 0 ||  !item.id) {
                                arr.push(item);
                            }
                        });
                        $scope.invoiceDetails.invoiceLineItemDtoList = arr;
                    }
                }

            };

            $scope.moveToNextStep = function() {
                $scope.steps[0] = {
                    inProgress: false,
                    completed: true
                };
                $scope.steps[1] = {
                    inProgress: true,
                    completed: false
                };
                var trips = $scope.selectedTrips;
                if (trips && trips.length > 0) {
                    var tripBillingIdsList = [];
                    $scope.invoiceDetails = {
                        invoiceLineItemDtoList: [],
                        address: $scope.addresses[$scope.selectedAddressIndex]
                    };
                    var transportationCost = 0;
                    trips.forEach(function(o) {
                        transportationCost += +o.invoiceAmount;
                        tripBillingIdsList.push(o.id);
                    });
                    transportationCost = Math.round(transportationCost * 100) / 100;
                    $scope.invoiceDetails.invoiceLineItemDtoList.push({
                        description: "Transportation charges",
                        amount: transportationCost,
                        id: 0
                    });
                    $scope.invoiceDetails.tripBillingIdsList = tripBillingIdsList;
                    $scope.invoiceDetails.totalCost = transportationCost;
                }
            };

            $scope.save = function(onSuccess) {
                var totalCost = 0;
                $scope.invoiceDetails.invoiceLineItemDtoList.forEach(function(o) {
                    totalCost += +o.amount;
                });
                if ($scope.invoiceDetails.totalCost !== totalCost) {
                    return false;
                }
                $scope.invoiceDetails.totalCost = Math.round($scope.invoiceDetails.totalCost);
                if ($scope.invoiceDetails.creationDate) {
                    $scope.invoiceDetails.creationDate = $scope.invoiceDetails.creationDate.valueOf();
                }
                $scope.invoiceDetails.addressId = $scope.invoiceDetails.address.id;
                var currentUser = $scope.UserProfile.user_name;
                return InvoiceService.createInvoice($scope.invoiceDetails , currentUser).then(function() {
                    return true;
                }, function() {
                  return false;
                });

            };
        }
    ]);
