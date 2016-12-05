'use strict';
angular.module('financeUiApp')
  .factory('MissingTripsService', ['HttpQService', function(HttpQService){
  	return{

  		getAllVehicles: function(){
  			return HttpQService.get('missingtripsdetail/vehicles');
  		},
  		getAllStartHubs: function(){
  			return HttpQService.get('missingtripsdetail/starthubs');
  		},
  		getAllEndHubs: function(){
  			return HttpQService.get('missingtripsdetail/endhubs');
  		},
  		getMissingTripDetailsList: function(vehicleNumber,client,startHub,endHub,dateFilter,startTime,endTime,kmgt,kmlt,status){
  			var url = 'missingtripsdetail?';
        
        if(vehicleNumber){
          url = url + 'vehicleNo=' + vehicleNumber;
        }
  			if(client ){
  				url = url + '&client=' + client;
  			}
  			if(startHub){
  				url = url + '&startHub=' + startHub;
  			}
        if(dateFilter){
          url = url + '&dateRange=' + dateFilter;
        }
  			if(endHub){
  				url = url + '&endHub=' + endHub;
  			}
  			if(startTime){
  				url = url + '&startTime=' + startTime;
  			}
  			if(endTime){
  				url = url + '&endTime=' + endTime;
  			}
  			if(kmgt){
  				url = url + '&kmgt=' + kmgt;
  			}
  			if(kmlt){
  				url = url + '&kmlt=' + kmlt;
  			}
        if(status){
          url = url + '&status=' + status;
        }
  			return HttpQService.get(url);
  		}
  	};
  }]);