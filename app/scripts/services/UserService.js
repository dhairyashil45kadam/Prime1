'use strict';
angular.module('financeUiApp')
  .factory('UserService', ['HttpQService', function(HttpQService) {
    return {
      getAllUsers: function() {
        return HttpQService.get('userclientmapping/getuser');
      },
      getClientsforUser: function(userName) {
        return HttpQService.get('userclientmapping?user=' + userName);
      },
      toggleClientforUser: function(userName,clientId) {
        return HttpQService.post('userclientmapping/toggleclient?' +  'currentUser=' + userName + '&clientId=' + clientId);
      },
      assignClientsToUser: function(clientList , userName) {
        return HttpQService.post('userclientmapping/?currentUser=' + userName,clientList);
      },
      getAllClients: function() {
        return HttpQService.get('client/getall');
      }
    };
  }]);
