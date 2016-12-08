'use strict';
angular.module('financeUiApp')
  .controller('UploadCsvCtrl', ['$scope',
    function ($scope) {
    	//console.log($scope.globalType);
    	if ($scope.globalType == 'routesUpload') {
    		$scope.headerText = "Upload CSV For Routes";
    	}else{
    		$scope.headerText = "Upload CSV For Rates";
    	}
        $scope.save = function(element) {
        	//console.log($scope.csv.result.filename);
        	//fileName.substr(fileName.lastIndexOf('.')+1)
        	var extn = $scope.csv.result.filename.substr($scope.csv.result.filename.lastIndexOf('.')+1);
        	//console.log($scope.csv.result);
        	if ($scope.globalType == 'routesUpload') {
	        	if(extn=="csv"){
	        		var actualdata = [];
	        		var clientName;
	        		$scope.csv.result.forEach(function(data,i) {
	        			var tripdata = {};
	        			if(i==0){
	        				var clientName = data[0];	
	        				actualdata.clientName = clientName;
	        			}
	        			if(i>2){
	        				var str = data[0].toString().replace(/"/g, "");
	  						var res = str.split(",");
	        				tripdata.tripCode = res[0];
	        				tripdata.vehicleType = res[1];
	        				tripdata.route = res[2];
	        				tripdata.baseRate = res[3];
	        				tripdata.fuelSurcharge = res[4];
	        				tripdata.loadingDetention = res[5];
	        				tripdata.unloadingDetention = res[6];
	        				tripdata.lateCharge = res[7];
	        				tripdata.loading = res[8];
	        				tripdata.Unloading = res[9];
	        				tripdata.greenTax = res[10];
	        				tripdata.otherCharges = res[11];
	        				tripdata.invoiceAmount = res[12];
	        				tripdata.comments = res[13];
	        				tripdata.vehicleNumber = res[14];
	        				tripdata.tripType = res[15];
	        				tripdata.vehicleType = res[16];
	        				tripdata.tripStartTime = res[17];
	        				tripdata.tripEndTime = res[18];
	        				tripdata.startCwhInTime = res[19];
	        				tripdata.startCwhOutTime = res[20];
	        				tripdata.startCwhDelay = res[21];
	        				tripdata.endCwhInTime = res[22];
	        				tripdata.endCwhOutTime = res[23];
	        				tripdata.endCwhDelay = res[24];
	        				tripdata.currentFuelRate = res[25];
	        				tripdata.fuelSurchargeType = res[26];
	        				tripdata.fuelBaseRate = res[27];
	        				tripdata.applicableAbove = res[28];
	        				tripdata.fuelRateChangeType = res[29];
	        				tripdata.baseValue = res[30];
	        				tripdata.edited = res[31];
	        				actualdata.push(tripdata);
	        			} 
	        		});	
	        		
	        		console.log(actualdata);
	        	} else {
	        		console.log("Filetype you are trying to upload is not valid. please upload csv file.");	
	        	}
        	} else {

        	}
        	
      	};

    }
  ]);
