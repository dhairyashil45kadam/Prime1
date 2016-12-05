'use strict';

angular.module('financeUiApp')
  .controller('DocumentsTracking', ['$scope',
    function ($scope) {

      $scope.headerText = "Upload documents";

      $scope.documents = [
         {
            "recordId":60505,
            "documentName": "POD",
            "documentURL": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRTHixjZYqUVpe-q5Jxy0npNtrLdwEPE8xkk-QYtHb6OcOYFpiNpHXQmQ",
            "verified": false
         }, {
            "recordId": 34353,
            "documentName": "LR",
            "documentURL": null,
            "verified": false
         }
      ];

      $scope.uploadFiles = function (input) {
        uploadedFiles[input.name] = input.files[0];;
        $scope.$digest();
      };
    }
  ]);
