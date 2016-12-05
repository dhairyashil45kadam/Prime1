'use strict';

angular.module('financeUiApp')
  .controller('ClientCtrl', ['$rootScope', '$scope', 'InvoiceService', 'ClientService', 'ngDialog', '$filter','UserProfileFactory','PermissionConstant',
    function ($rootScope, $scope, InvoiceService, ClientService, ngDialog, $filter,UserProfileFactory,PermissionConstant) {

      $scope.headOpen = true;
      $scope.tabSelected = "PENDING";
      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      $scope.clientDetailsColumns = {
        columns: [{
          label: "id",
          key: "id",
          className: "id",
          showDownArrow: true
        }, {
          label: "Billing cycle",
          key: "billingCycle",
          className: "tripType",
          showDownArrow: true,
        }, {
          label: "Fuel Surcharge",
          key: "fuelSurcharge",
          className: "vehicleType",
          showDownArrow: true
        }, {
          label: "Approved by",
          key: "approvyedB",
          className: "baseRate",
          showDownArrow: true
        }, {
          label: "Detention",
          key: "detention",
          className: "detention",
          showDownArrow: true
        }, {
          label: "Created by",
          key: "createdBy",
          className: "lateCharge",
          showDownArrow: true
        }, {
          label: "IsActive",
          key: "isActive",
          className: "loading",
          showDownArrow: true
        }, {
          label: "Contract start date",
          key: "contractStartDate",
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          },
          showDownArrow: true
        }, {
          label: "Contract end date",
          key: "contractEndDate",
          className: "greenTax",
          showDownArrow: true
        }, {
          label: "Created date",
          key: "createdDate",
          className: "applicableFromDate",
          showDownArrow: true,
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          }
        }, {
          label: "Last updated date",
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
              ClientService.changeClientApprovalDetails($scope.filters.client.id, row.id,userName, changedRow).then(function() {
                row = changedRow;
              });
            },
            show: function() {
              return $scope.tabSelected === "PENDING" && $scope.UserProfile.$hasAnyRole(PermissionConstant.approveClient);
            }
          }, {
          label: "Reject",

          action: function(row) {
              var changedRow = angular.extend({}, row);
              changedRow.approvalStatus = "REJECTED";
                var userName = $scope.UserProfile.user_name;
              ClientService.changeClientApprovalDetails($scope.filters.client.id, row.id,userName, changedRow).then(function() {
                row = changedRow;
              });
            },
          show: function() {
            return ($scope.tabSelected === "PENDING" || $scope.tabSelected === "APPROVED") && $scope.UserProfile.$hasAnyRole(PermissionConstant.rejectClient);
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
      }]
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

      function setTabData() {
        var tab = $scope.tabSelected;
        $scope.clientDetails = {};
        var client = [];
        if ($scope.clientHistory) {
          $scope.clientHistory.forEach(function(obj) {
            if(tab === "PENDING" && obj.approvalStatus === "PENDING") {
              client.push(obj);
            } else if(tab === "APPROVED" && obj.approvalStatus === "APPROVED") {
              client.push(obj);
            } else if(tab === "REJECTED" && obj.approvalStatus === "REJECTED") {
              client.push(obj);
            }
          });
        } else {
          console.log("Nothing is present");
        }
        $scope.clientDetails = client;
      }

      $scope.tabClicked = function(tab) {
        if($scope.tabSelected && $scope.tabSelected === tab) {
          return;
        }
        $scope.tabSelected = tab;
        $scope.filter();
      };

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
        $rootScope.$emit('load-start');

        ClientService.getClientBillingDetails(clientId).then(function(response) {
          $scope.clientHistory = response;
          console.log(response);
          setTabData();
          $rootScope.$emit('load-stop');
        }, function() {
          showErrorAlert("Unable to add rates info. Try again later.");
          $rootScope.$emit('load-stop');
        });

      };
    }
  ]);
