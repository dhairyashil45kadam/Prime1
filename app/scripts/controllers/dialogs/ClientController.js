'use strict';

angular.module('financeUiApp')
  .controller('ClientController', ['$scope', 'ClientService', 'ngDialog','PermissionConstant','UserProfileFactory',
    function ($scope, ClientService, ngDialog,PermissionConstant,UserProfileFactory) {

      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      function showAlert(alert, error) {
        $scope.showAlert = true;
        $scope.alertMessage = alert;
        if(error) {
          $scope.errorAlert = true;
        } else {
          $scope.errorAlert = false;
        }
      }

      if($scope.globalData && $scope.globalData.client) {
        $scope.client = $scope.globalData.client;
      }
      if($scope.client && $scope.client.id) {
        $scope.isEditClientFlow = true;
      }
      if($scope.isEditClientFlow) {
        $scope.headerText = "Edit client information";
      } else {
        $scope.headerText = "Enter new client information";
      }

      $scope.documentTypes = [{
        text : 'CLIENT_CONTRACT',
        value: 'Client Contract'
      }, {
        text : 'EMAIL_DOCUMENT',
        value : 'Email_document'
      }, {
        text : 'RATE_ANNEXURE',
        value : 'Rate_annexure'
      }
    ];

      $scope.documentClientTypes = [{
        text : 'CLIENT_BILLING',
        value : 'Client Billing'
      }];

      $scope.billingCycles = [{
        text: "10 days",
        value: "TEN_DAYS"
      }, {
        text: "15 days",
        value: "FIFTEEN_DAYS"
      }, {
        text: "30 days",
        value: "THIRTY_DAYS"
      }];

      $scope.addNewAddress = function() {
        $scope.addressDialog = {};
        var dialog = ngDialog.open({
          templateUrl: 'views/dialogs/addressDetails.html',
          appendClassName: 'addressDialog',
          scope: $scope,
          closeByDocument: false
        });
        dialog.closePromise.then(function (data) {
          if(data.value) {
            data.value.clientContactPersonType = "BILLING";
             var currentUser = $scope.UserProfile.user_name;
            ClientService.addClientAddress($scope.client.id, data.value , currentUser).then(function(res) {
              if(!$scope.addresses) {
                $scope.addresses = [];
              }
              $scope.addresses.push(angular.extend({}, res));
              $scope.carouselIndex = $scope.addresses.length - 1;
            }, function() {
              showAlert("Unable to add address", true);
            });
          }
        });
      };

      $scope.states = [
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chandigarh',
        'Chhattisgarh',
        'Delhi',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jammu & Kashmir',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha (Orissa)',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttar Pradesh',
        'Uttarakhand',
        'West Bengal',
        'Andaman and Nicobar Islands',
        'Dadar and Nagar Haveli',
        'Daman and Diu',
        'Lakshadweep',
        'Puducherry'
      ];

      $scope.uplaodFiles = function(input) {
        $scope.fileDialog.multiPartFile = input.files[0];
      };
      $scope.addNewFile = function() {
        $scope.fileDialog = {};
        var dialog = ngDialog.open({
          templateUrl: 'views/dialogs/fileUpload.html',
          appendClassName: 'fileDialog',
          scope: $scope,
          closeByDocument: false
        });
        dialog.closePromise.then(function (data) {
          if(data.value) {
            var fd = new FormData();
            fd.append('documentClientType',data.value.documentClientType);
            fd.append('documentType',data.value.documentType);
            fd.append('clientId',$scope.client.id);
            fd.append('referenceId',$scope.clientBillingDetails.id);
            fd.append('multipartFile', data.value.multiPartFile);
            fd.append('currentUser' , $scope.UserProfile.user_name);
            ClientService.addContractFile(fd , $scope.client.id).then(function(res) {
              if(!$scope.existingContracts) {
                $scope.existingContracts = [];
              }
              $scope.existingContracts.push(angular.extend({}, res.object));
              $scope.carouselIndex = $scope.existingContracts.length - 1;
            }, function() {
              showAlert("Unable to add client contract", true);
            });
          }
        });
      };

      $scope.editAddress = function(address) {
        $scope.addressDialog = angular.extend({}, address);
        var dialog = ngDialog.open({
          templateUrl: 'views/dialogs/addressDetails.html',
          appendClassName: 'addressDialog',
          scope: $scope,
          closeByDocument: false
        });
        dialog.closePromise.then(function (data) {
          if(data.value) {
            var currentUser = $scope.UserProfile.user_name;
            ClientService.addClientAddress($scope.client.id, data.value , currentUser).then(function(res) {
              angular.extend(address, res);
            }, function() {
              showAlert("Unable to edit billing address");
            });
          }
        });
      };
      $scope.viewClientContract = function(clientContract) {
        $scope.fileDialog = angular.extend({}, clientContract);
        var dialog = ngDialog.open({
          templateUrl: 'views/dialogs/fileUpload.html',
          appendClassName: 'fileDialog',
          scope: $scope,
          closeByDocument: false
        });
      };

      $scope.removeAddress = function(index) {
        var address = $scope.addresses[index];
        address.isActive = false;
        var currentUser = $scope.UserProfile.user_name;
        ClientService.addClientAddress($scope.client.id, address ,currentUser).then(function() {
          $scope.addresses.splice(index, 1);
        }, function() {
          showAlert("Unable to delete billing address");
        });
      };
      $scope.removeClientContract = function(index) {
        var clientContract = $scope.existingContracts[index];
        ClientService.deleteContractFile($scope.client.id, clientContract.id).then(function() {
          $scope.existingContracts.splice(index, 1);
        }, function() {
          showAlert("Unable to delete client contract");
        });
      };

      $scope.addNewEscalationDetails = function() {
        if(!$scope.clientBillingDetails) {
          $scope.clientBillingDetails = {};
        }
        if(!$scope.clientBillingDetails.clientContactPersonDtoList) {
          $scope.clientBillingDetails.clientContactPersonDtoList = [];
        }
        $scope.clientBillingDetails.clientContactPersonDtoList.push({
          name: "",
          number: "",
          email: ""
        });
      };

      function getClientExistingAddress() {
        ClientService.getBillingAddresses($scope.client.id).then(function(response) {
          $scope.addresses = response;
          $scope.addresses.forEach(function(obj){
            var str = obj.address? obj.address.replace(/(?:\r\n|\r|\n)/g, '<br />'): "";
            obj.addressWithBrTag = str;
          });
        }, function() {
          showAlert("Unable to fetch existing addresses", true);
        });
      }

      getClientExistingAddress();

      function getContractFilesForClient() {
        $scope.existingContracts = [];
        ClientService.getContractFiles($scope.documentClientTypes[0].text , $scope.client.id).then(function(response) {
          $scope.existingContracts = response.object;

        } , function() {
          showAlert("Unable to fetch documents" , true);
        });
      }
      getContractFilesForClient();

      function getClientBillingDetails() {
        ClientService.getBillingDetails($scope.client.id).then(function(response) {
          $scope.clientBillingDetails = response;
          if($scope.clientBillingDetails.contractStartDate && $scope.clientBillingDetails.contractEndDate) {
            $scope.clientBillingDetails.contractStartDate = moment($scope.clientBillingDetails.contractStartDate);
            $scope.clientBillingDetails.contractEndDate = moment($scope.clientBillingDetails.contractEndDate);
          }
        }, function() {
          showAlert("Unable to fetch client billing details", true);
        });
      }
      getClientBillingDetails();
      
      $scope.save = function() {
        if($scope.clientBillingDetails.contractStartDate !== null && 
            $scope.clientBillingDetails.contractEndDate !== null &&
            $scope.clientBillingDetails.billingCycle.toString() !== null &&
            $scope.clientBillingDetails.creditPeriodDays.toString() !== null)
        {
          $scope.clientBillingDetails.contractStartDate = $scope.clientBillingDetails.contractStartDate.valueOf();
          $scope.clientBillingDetails.contractEndDate = $scope.clientBillingDetails.contractEndDate.valueOf();
          if($scope.clientBillingDetails.clientContactPersonDtoList && $scope.clientBillingDetails.clientContactPersonDtoList.length > 0) {
            $scope.clientBillingDetails.clientContactPersonDtoList.forEach(function(o, index) {
              o.clientContactPersonType = index === 0? "ESCALATION_ONE" : "ESCALATION_TWO";
            });
          }
          var userName = $scope.UserProfile.user_name;
          ClientService.saveClientBillingDetails($scope.client.id, $scope.clientBillingDetails,userName).then(function() {
          });
        }
        else
        {
          console.log('error');
          return false;
        }

      };

      // $scope.addresses = [{
      //   id: 0,
      //   contactName: "Amazon",
      //   phone: "9987465273",
      //   addressLine1: "Amazon service ltd., 12/43",
      //   city: "Pataudi",
      //   state: "Haryana",
      //   country: "India",
      //   pincode: "122003"
      // }, {
      //   id: 1,
      //   contactName: "Flipkart",
      //   phone: "9987465273",
      //   addressLine1: "Amazon service ltd., 12/43",
      //   city: "Pataudi",
      //   state: "Haryana",
      //   country: "India",
      //   pincode: "122003"
      // }, {
      //   id: 2,
      //   contactName: "Snapdeal",
      //   phone: "9987465273",
      //   addressLine1: "Amazon service ltd., 12/43",
      //   city: "Pataudi",
      //   state: "Haryana",
      //   country: "India",
      //   pincode: "122003"
      // }];
      // }, {
      //   name: "ABC",
      //   phone: "9987465273",
      //   addressLine1: "Amazon service ltd., 12/43",
      //   city: "Pataudi",
      //   state: "Haryana",
      //   country: "India",
      //   pincode: "122003"
      // },{
      //   name: "XYZ",
      //   phone: "9987465273",
      //   addressLine1: "Amazon service ltd., 12/43",
      //   city: "Pataudi",
      //   state: "Haryana",
      //   country: "India",
      //   pincode: "122003"
      // },{
      //   name: "DEF",
      //   phone: "9987465273",
      //   addressLine1: "Amazon service ltd., 12/43",
      //   city: "Pataudi",
      //   state: "Haryana",
      //   country: "India",
      //   pincode: "122003"
      // }];
    }
  ]);
