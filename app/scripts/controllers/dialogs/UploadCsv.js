'use strict';
angular.module('financeUiApp')
  .controller('UploadCsvCtrl', ['$scope',
    function ($scope) {

       $scope.headerText = "Upload CSV";
       $scope.uploadFiles = function(element) {

           $scope.$apply(function(scope) {
               var photofile = element.files[0];
               var reader = new FileReader();
               reader.onload = function(e) {
                  var contents = e.target.result;
                  scope.$apply(function () {
                    scope.fileReader = contents;
                    console.log(scope.fileReader);
                  });
               };
               //console.log(photofile)
               reader.readAsDataURL(photofile);
           });
      };

    }
  ]);