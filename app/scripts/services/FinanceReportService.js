'use strict';
angular.module('financeUiApp')
  .factory('FinanceReportService', ['HttpQService', function(HttpQService){
  	return{

  		getFinanceReportForClient: function(clientIdList,verticalList,dateRange,startTime,endTime,statusList){
  			var url = 'financereport?clientIdList=' + clientIdList + '&tripBillingStatusList=' + statusList;
        if(verticalList){
          url = url + '&verticalList=' + verticalList;
        }
        if(dateRange){
          url = url + '&dateRange=' + dateRange;
        }
        if(startTime){
          url=url+ '&startTime=' + startTime;
        }
        if(endTime){
          url = url + '&endTime=' + endTime;
        }
  			return HttpQService.get(url);
  		}
  	};
  }]);