'use strict';

angular.module('financeUiApp')
  
  .controller('HomeCtrl', ['$rootScope', '$scope', 'ClientService','UserProfileFactory','PermissionConstant',
    function ($rootScope, $scope, ClientService,UserProfileFactory,PermissionConstant) {
      $scope.UserProfile =  UserProfileFactory.$$state.value;
			$scope.PermissionConstant = PermissionConstant;

      function editClientBillingDetails(client) {
        $rootScope.$emit('show-topDrawer', {
  				template: 'views/dialogs/clientBillingDetails.html',
  				controller: 'ClientController',
          data: {
            client: client
          },
  				heading: "Complete client details"
  			});
      }

      $scope.clientTableData = {
        hideSerialNo: false,
        columns: [{
          label: "Client name",
          key: "clientName",
          className: "clientName",
          showDownArrow: true
        }, {
          label: "Client code",
          key: "code",
          className: "clientCode",
          showDownArrow: true
        }],
        hideActions: !$scope.UserProfile.$hasAnyRole($scope.PermissionConstant.editClient),
        actions: [{
          label: "Edit billing details",
          action: editClientBillingDetails
        }]
      };

      function getClientsForDashBoard() {
        $rootScope.$emit('load-start');
        var userName = $scope.UserProfile.user_name;
        if (userName) {
        ClientService.getClientsWithFinancialInfo(true,userName).then(function(clients) {
          $scope.dashboardClients = clients;
          $rootScope.$emit('load-stop');
        }, function() {
          $scope.dashboardClients = [{
            clientName: "Amazon",
            code: "AMZ"
          }, {
            clientName: "Delhivery",
            code: "DHL"
          }, {
            clientName: "Bluedart",
            code: "BDT"
          }, {
            clientName: "Bluedart",
            code: "BDT"
          }, {
            clientName: "Bluedart",
            code: "BDT"
          }, {
            clientName: "Bluedart",
            code: "BDT"
          }];
          $rootScope.$emit('load-stop');
        });
      }
      }

      getClientsForDashBoard();

    }
  ]);
