'use strict';

angular.module('financeUiApp')
  .controller('DetentionDetailsController', ['$rootScope', '$scope', 'InvoiceService','DetentionService', 'UserProfileFactory','$filter', 'PermissionConstant',
    function($rootScope, $scope, InvoiceService, DetentionService, UserProfileFactory, $filter, PermissionConstant) {

      function hasValue(a) {
        return a || a === 0;
      }

      function truncateValue(a) {
        if(!a) {
          a = 0;
        }
        if(typeof a === "string") {
          a = a.replace(/,/g, '');     //remove , from a formatted value
        }
        return $filter('number')(a, 2);
      }

      function showAlertAndSetMessage(message){
        $scope.showAlert = true;
        $scope.alertMessage = message;
      }

      
      $scope.UserProfile = UserProfileFactory.$$state.value;
      $scope.PermissionConstant = PermissionConstant;

      if ($scope.globalData && $scope.globalData.detentionData) {
        $scope.detentionData = $scope.globalData.detentionData;
      }

      $scope.filters = {};

      //Auto fill previously saved values

      if($scope.detentionData && $scope.detentionData.detentionDetailDto){

        var detention = $scope.detentionData.detentionDetailDto.delayDataDtoList;
        if(detention[0].manualCwhInTime){
          $scope.filters.startcwhintime = moment(detention[0].manualCwhInTime);
        }
        if(detention[0].manualCwhOutTime){
          $scope.filters.startcwhouttime = moment(detention[0].manualCwhOutTime);
        }
        if(detention[0].delay){
          $scope.filters.startcwhdelaymanual = detention[0].delay;
        }
        if(detention[1].manualCwhInTime){
          $scope.filters.endcwhintime = moment(detention[1].manualCwhInTime);
        }
        if(detention[1].manualCwhOutTime){
          $scope.filters.endcwhouttime = moment(detention[1].manualCwhOutTime);
        }
        if(detention[1].delay){
          $scope.filters.endcwhdelaymanual = detention[1].delay;
        }
      }

      $scope.save = function() {
        var detentionDetails = {};
        var startCWHEntry=false,startCWHExit=false,endCWHEntry=false,endCWHExit=false;

        if($scope.detentionData){
          detentionDetails.tripBillingId = $scope.detentionData.id;
          if($scope.detentionData.clientId){
            detentionDetails.clientId = $scope.detentionData.clientId;
          }
          if($scope.detentionData.planningId){
            detentionDetails.planningId = $scope.detentionData.planningId;
          }
        }

        detentionDetails.delayDataDtoList = [];

        if($scope.detentionData.startPoint){
          detentionDetails.delayDataDtoList.push({
            cwhId: $scope.detentionData.startPoint
          }); 
        }

        if($scope.detentionData.endPoint){
          detentionDetails.delayDataDtoList.push({
            cwhId: $scope.detentionData.endPoint
          }); 
        }
        
        if($scope.filters.startcwhintime){
          startCWHEntry = true;
          detentionDetails.delayDataDtoList[0].manualCwhInTime = $scope.filters.startcwhintime._i;
        }
        if($scope.filters.startcwhouttime){
          startCWHExit = true;
          detentionDetails.delayDataDtoList[0].manualCwhOutTime = $scope.filters.startcwhouttime._i;
        }

        if($scope.filters.endcwhintime){  
          endCWHEntry = true;
          detentionDetails.delayDataDtoList[1].manualCwhInTime = $scope.filters.endcwhintime._i;
        }
        if($scope.filters.endcwhouttime){
          endCWHExit = true;
          detentionDetails.delayDataDtoList[1].manualCwhOutTime = $scope.filters.endcwhouttime._i;
        }

        if(!startCWHEntry && !endCWHEntry && !startCWHExit && !endCWHExit){
          showAlertAndSetMessage("Fill at least one warehouse details to save!");
          return false;
        }

        if((startCWHEntry && !startCWHExit) || (endCWHEntry && !endCWHExit) || (!startCWHEntry && startCWHExit) || (!endCWHEntry && endCWHExit)){
          showAlertAndSetMessage("Incomplete details!");
          return false;
        }

        var startcwhdelay = ($scope.filters.startcwhouttime-$scope.filters.startcwhintime)/(3600000),
        endcwhdelay = ($scope.filters.endcwhouttime-$scope.filters.endcwhintime)/(3600000);

        if((startCWHEntry && startCWHExit && startcwhdelay < 0) || (endCWHEntry && endCWHExit && endcwhdelay < 0) ){
          showAlertAndSetMessage("Out time should be more than in time!");
          return false;
        }
        
        if(startCWHEntry  && endCWHEntry && startCWHExit && endCWHExit &&  $scope.filters.endcwhintime < $scope.filters.startcwhouttime){
          showAlertAndSetMessage("Start warehouse out time should be less than end warehouse in time!");
          return false;
        }

        if($scope.filters.startcwhdelaymanual){
          detentionDetails.delayDataDtoList[0].delay = truncateValue(parseFloat($scope.filters.startcwhdelaymanual));
        } else{
          detentionDetails.delayDataDtoList[0].delay = truncateValue(parseFloat(startcwhdelay));
        }

        if($scope.filters.endcwhdelaymanual){
          detentionDetails.delayDataDtoList[1].delay = truncateValue(parseFloat($scope.filters.endcwhdelaymanual));
        } else{
          detentionDetails.delayDataDtoList[1].delay = truncateValue(parseFloat(endcwhdelay));
        }   

        var user_name = $scope.UserProfile.user_name;
        DetentionService.saveDetentionDetails(detentionDetails,user_name).then(function(res){
          console.log(res);
          return true;
        }, function(){
          $rootScope.$emit('load-stop');
          console.log("Error!");
          return false;
        });
      };
    }
  ]);
