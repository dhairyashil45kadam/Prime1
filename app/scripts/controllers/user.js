'use strict';

angular.module('financeUiApp')
    .controller('UserCtrl', ['$rootScope', '$scope', 'UserService', 'ClientService', 'ngDialog', '$filter', 'UserProfileFactory', 'PermissionConstant',
        function($rootScope, $scope, UserService, ClientService, ngDialog, $filter, UserProfileFactory, PermissionConstant) {


            $scope.UserProfile = UserProfileFactory.$$state.value;
            $scope.PermissionConstant = PermissionConstant;
            $scope.selectedUser = "";
            $scope.clients = [];
            $scope.selectedClients = [];
            $scope.clients1 = [];
            $scope.addUser = false;
            $scope.isEmailContain = false;
            $scope.tempAllCLients = [];

            $scope.globalButtons = [{
                label: "Add New User",
                show: function() {
                    return $scope.UserProfile.$hasAnyRole($scope.PermissionConstant.userClientMapping);
                },
                action: addNewUser
            }, {
                label: "Add Clients",
                show: function() {
                    return $scope.selectedClients && $scope.UserProfile.$hasAnyRole($scope.PermissionConstant.userClientMapping);
                },
                action: getAllClients
            }];

            var buttons = [];
            $scope.globalButtons.forEach(function(o) {
                buttons.push(o);
            });

            $scope.buttons = buttons;

            $scope.getUsers = function() {
                UserService.getAllUsers().then(function(response) {
                    if (response.object) {
                        $scope.allUsers = response.object;
                    }
                });
            }
            $scope.getUsers();

            $scope.onUserSelect = function(user) {
                if (user) {
                    angular.forEach($scope.allClients, function(value, key) {
                        value['ticked'] = false;
                    });
                    UserService.getClientsforUser(user).then(function(response) {
                        $scope.clients = response.object;
                    });
                }
            };

            function getAllClients() {
                UserService.getAllClients().then(function(response) {
                    $scope.allClients = response;
                })
            };

            function addNewUser() {
                $scope.addUser = true;
            };

            $scope.checkEmail = function(email) {
                if (email.match(/rivigo.com/gi)) {
                    $scope.isEmailContain = true;
                } else {
                    $scope.isEmailContain = false;
                }
            };

            $scope.addUserList = function(user) {
                $scope.allUsers.push(user);
                $scope.selectedUser = user;
                $scope.addUser = false;
                $scope.addedUser = "";
                $scope.onUserSelect(user);
            }

            $scope.saveClients = function() {
                var arr = [];
                var len = $scope.selectedClients.length;
                $scope.selectedClients.forEach(function(obj) {
                    var obj1 = {};
                    obj1.userName = $scope.selectedUser;
                    obj1.clientId = obj.id;
                    obj1.clienCode = obj.code;
                    arr.push(obj1);
                });

                var userName = $scope.UserProfile.user_name;
                UserService.assignClientsToUser(arr, userName).then(function(response) {
                    $scope.onUserSelect($scope.selectedUser);
                });
            }


            $scope.clientTable = {
                columns: [{
                    label: "Client name",
                    key: "clientName",
                    className: "clientName",
                    showDownArrow: true
                }],
                actions: [{
                    label: "remove",
                    action: function(row) {
                        UserService.toggleClientforUser($scope.selectedUser, row.id).then(function(response) {
                            var idx = _.findIndex($scope.clients, function(obj) {
                                return obj.id === row.id;
                            });
                            if (idx !== -1) {
                                $scope.clients.splice(idx, 1);
                            }
                        });
                    }
                }]
            }
        }
    ]);
