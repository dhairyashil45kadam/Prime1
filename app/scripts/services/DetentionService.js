'use strict';
angular.module('financeUiApp')
  .factory('DetentionService', ['HttpQService', function(HttpQService){
  	return{
  		saveDetentionDetails: function(detentionDetails,user){
  			return HttpQService.post('detentiondetail/createdetentiondetail?currentUser='+ user, detentionDetails);
  		}	
  	};
  }]);