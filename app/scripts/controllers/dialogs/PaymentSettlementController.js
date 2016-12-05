'use strict';

angular.module('financeUiApp')
  .controller('PaymentSettlementController', ['$scope', 'ClientService',
    function ($scope, ClientService) {
      $scope.totalBalance = 0;
      if($scope.globalData && $scope.globalData.invoices) {
        $scope.invoices = $scope.globalData.invoices;
        var total = 0;
        $scope.invoices.forEach(function(i) {
          total += Number(i.amountReceivedTemp);
        });
        $scope.totalBalance = total;
      }

      $scope.reviewAction = [{
        label: "Review invoices",
        action: function() {
          $scope.closeInvoices = !$scope.closeInvoices;
          $scope.openPayment = false;
        }
      }];

      $scope.continueAction = [{
        label: "Continue",
        action: function() {
          $scope.closeInvoices = !$scope.closeInvoices;
          $scope.openPayment = true;
        }
      }];

      $scope.paymentTableData = {
        columns: [{
          label: "Client",
          key: "clientCode",
          className: "clientCode"
        }, {
          label: "Invoice no",
          key: "invoiceNo",
          className: "invoiceNo"
        }, {
          label: "Amount received",
          key: "amountReceivedTemp",
          className: "amountReceived"
        }, {
          label: "TDS deducted",
          key: "tdsDeductedTemp",
          className: "tdsDeducted"
        }],
        hideActions: true
      };
    }
  ]);
