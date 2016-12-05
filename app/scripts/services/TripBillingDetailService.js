'use strict';
angular.module('financeUiApp')
  .factory('TripBillingDetailService', ['HttpQService', function(HttpQService){
  	return{

  		getTripBillingDetailsList: function(clientId,startTime,endTime){
  			var url = 'tripbillingdetail/getAll?client=' + clientId + '&startTime=' + startTime + '&endTime=' + endTime;
  			return HttpQService.get(url);
  		},
      
  		splitByCategory: function(splitCategoryDto, currentUser){
  			var url = 'tripbillingdetail/splitbycategory?currentUser=' + currentUser;
  			return HttpQService.post(url, splitCategoryDto);
  		},

      updateClientRoute: function(clientId) {
        var url = 'tripbillingdetail/updateclientroute?clientId=' + clientId;
        return HttpQService.post(url);
      }
  	};
  }]);