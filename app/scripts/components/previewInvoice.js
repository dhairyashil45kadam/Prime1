'use strict';
angular.module("financeUiApp")
    .directive('previewInvoice', function () {

        function convertAmountToWords(num) {
          num = Math.floor(num);
          var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
          var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

          if ((num = num.toString()).length > 9) {
            return "";
          }
          var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
          if (!n) {
            return;
          }
          var str = '';
          str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
          str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
          str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
          str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
          str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
          return str + " only";
        }

        function roundOff(num) {
          return Math.floor(num*100)/100;
        }

        var controller = ['$scope', function($scope) {
          $scope.addmorelineitems = function() {
          //  var idx, lastObj, transportationObj = {};
            if($scope.invoiceDetails) {
              if(!$scope.invoiceDetails.invoiceLineItemDtoList) {
                $scope.invoiceDetails.invoiceLineItemDtoList = [];
              }
              $scope.invoiceDetails.invoiceLineItemDtoList.push({
                description: "Description",
                amount: 0
              });

              // lastObj = $scope.invoiceDetails.invoiceLineItemDtoList[$scope.invoiceDetails.invoiceLineItemDtoList.length - 1];
              // if ($scope.invoiceDetails.invoiceLineItemDtoList.length > 0) {
              //     idx = _.findIndex($scope.invoiceDetails.invoiceLineItemDtoList, function(obj) {
              //         return obj.id === 0;
              //     });
              //     transportationObj = $scope.invoiceDetails.invoiceLineItemDtoList[idx];
              //     $scope.invoiceDetails.invoiceLineItemDtoList.splice(idx,1);
              //
              //     transportationObj.amount = transportationObj.amounnt - lastObj.amount;
              //     $scope.invoiceDetails.invoiceLineItemDtoList.unshift(transportationObj);
              // }

            }
          };


          function htmlToPlaintext(text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
          }
          $scope.removeHtmlTags = function(address){
            $scope.addressEditable = true;
            var plain_text = htmlToPlaintext( address );
            $scope.invoice.address.addressWithBrTag = plain_text;
            console.log($scope.invoice.address.addressWithBrTag);
          };
          $scope.addHtmlTags = function(address){
            $scope.addressEditable = false;
            var addressWithBr = address.replace(/,/g, ',<br> ');
            $scope.invoice.address.addressWithBrTag = addressWithBr;
            console.log($scope.invoice.address.addressWithBrTag);
          };


          $scope.removeLineItem = function(index) {
            var amountTobeAddedToTotalCost = $scope.invoiceDetails.invoiceLineItemDtoList[index].amount;
            $scope.invoiceDetails.invoiceLineItemDtoList.splice(index, 1);
            var idx = _.findIndex($scope.invoiceDetails.invoiceLineItemDtoList, function(obj) {
              return obj.id === 0;
            });
            var transportationCost = $scope.invoiceDetails.invoiceLineItemDtoList[idx];
            transportationCost.amount = transportationCost.amount +  amountTobeAddedToTotalCost;
            $scope.invoiceDetails.invoiceLineItemDtoList[idx] = transportationCost;
          };
        }];

        return {
            restrict: 'E',
            scope: {
              invoiceDetails: "=",
              editable: "@"
            },
            templateUrl: "views/components/previewInvoice.html",
            controller: controller,

            link: function ($scope) {
              $scope.panHasP = false;
              $scope.taxScheme = "scheme1";
              
              function calculate() {
                if($scope.invoiceDetails && $scope.invoiceDetails.address && $scope.invoiceDetails.address.panNumber){
                  if($scope.invoiceDetails.address.panNumber[3] =='P' || $scope.invoiceDetails.address.panNumber[3] =='p'){
                    $scope.taxScheme = "scheme2";
                    $scope.panHasP = true;
                  }
                }
                if($scope.taxScheme == "scheme1") {
                  $scope.salesTaxRate = 14.0;
                  $scope.sbcRate = 0.5;
                  $scope.kkcRate = 0.5;
                }
                else {
                  $scope.salesTaxRate = 4.2;
                  $scope.sbcRate = 0.15;
                  $scope.kkcRate = 0.15;
                }
                $scope.invoice.serviceTaxAmount = (!$scope.includeTaxes && !$scope.panHasP) ? 0 : Math.ceil(Number($scope.invoice.totalCost) * Number($scope.salesTaxRate) / 100);
                $scope.invoice.sbcTaxAmount = (!$scope.includeTaxes && !$scope.panHasP) ? 0 : Math.ceil(Number($scope.invoice.totalCost) * Number($scope.sbcRate) / 100);
                $scope.invoice.kkcTaxAmount = (!$scope.includeTaxes && !$scope.panHasP) ? 0 : Math.ceil(Number($scope.invoice.totalCost) * Number($scope.kkcRate) / 100);
                $scope.invoice.totalTax = (!$scope.includeTaxes && !$scope.panHasP) ? 0 : roundOff(Number($scope.invoice.serviceTaxAmount) + Number($scope.invoice.sbcTaxAmount) + Number($scope.invoice.kkcTaxAmount));
                $scope.invoice.invoiceAmount = roundOff(Number($scope.invoice.totalCost) + Number($scope.invoice.totalTax));
                var roundUp = false;
                if($scope.invoice.roundUp)
                  roundUp = true;
                else
                  roundUp =  false;
                $scope.invoice.roundUp = roundUp;
                if(!$scope.invoice.roundUp)
                  $scope.invoice.invoiceAmount = roundOff(Number($scope.invoice.totalCost) + Number($scope.invoice.totalTax));
                else
                  $scope.invoice.invoiceAmount = Math.ceil(Number($scope.invoice.totalCost) + Number($scope.invoice.totalTax));
                $scope.invoice.amountInWords = convertAmountToWords($scope.invoice.invoiceAmount);
              }

              function loadData() {
                $scope.invoice = {};
                if($scope.invoiceDetails) {
                  $scope.invoice = $scope.invoiceDetails;
                  if($scope.invoiceDetails.includeTaxes || $scope.invoiceDetails.includeTaxes === false) {
                    $scope.includeTaxes = $scope.invoiceDetails.includeTaxes;
                  }
                  calculate();
                }
              }
              $scope.$watch('invoiceDetails', loadData, true);
              $scope.$watch('includeTaxes', calculate);
              $scope.$watch('taxScheme',calculate);
              $scope.$watch('roundOff',calculate);
            }
        };
});
