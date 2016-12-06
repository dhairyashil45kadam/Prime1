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
        	console.log($scope.csv.result);
      	};

    }
  ]);
