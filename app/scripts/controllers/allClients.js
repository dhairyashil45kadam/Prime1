'use strict';

angular.module('financeUiApp')
    .controller('AllClientsCtrl', ['$rootScope', '$scope', '$filter', 'ClientService','UserProfileFactory','PermissionConstant',
        function($rootScope, $scope, $filter, ClientService,UserProfileFactory,PermissionConstant) {

            $scope.UserProfile = UserProfileFactory.$$state.value;
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

            $scope.clientTable = {
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
                }, {
                    label: "Billing cycle",
                    key: "billingCycle",
                    showDownArrow: true
                }, {
                    label: "Fuel surcharge type",
                    key: "fuelSurchargeType",
                    className: "fuelSurchargeType",
                    showDownArrow: true
                }, {
                    label: "Start date",
                    key: "contractStartDate",
                    showDownArrow: true,
                    formatter: function(value) {
                        return $filter('date')(value, 'dd/MM/yyyy');
                    }
                }, {
                    label: "End date",
                    key: "contractEndDate",
                    showDownArrow: true,
                    formatter: function(value) {
                        return $filter('date')(value, 'dd/MM/yyyy');
                    }
                }],
                hideActions: false,
                actions: [{
                    label: "Edit billing details",
                    show: function() {
                      return $scope.UserProfile.$hasAnyRole(PermissionConstant.editClient);
                    },
                    action: editClientBillingDetails
                }]
            };

            function showAllClients() {
                $rootScope.$emit('load-start');
                var userName = $scope.UserProfile.user_name;
                ClientService.getClientsDetails(userName).then(function(clients) {
                    $scope.showClients = clients;
                    $rootScope.$emit('load-stop');
                }, function() {
                    console.log("Could not fetch routes");
                });
            }

            showAllClients();
        }
    ]);
