'use strict';
angular.module('financeUiApp')
  .controller('UploadCsvCtrl', ['$scope',
    function ($scope) {

       $scope.headerText = "Upload CSV";
       $scope.save = function(element) {
            console.log($scope.csv.result);
           
      };

    }
  ]);