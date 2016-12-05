'use strict';

angular.module('financeUiApp')
  .controller('PaymentCtrl', ['$rootScope', '$scope', 'InvoiceService',
    function ($rootScope, $scope, InvoiceService) {

      $scope.paymentTableData = {
        columns: [{
          label: "Client",
          key: "clientCode",
          className: "clientCode",
          showDownArrow: true
        }, {
          label: "Invoice no",
          key: "invoiceNo",
          className: "invoiceNo",
          showDownArrow: true
        }, {
          label: "Invoice date",
          key: "invoiceDate",
          className: "invoiceDate",
          showDownArrow: true
        }, {
          label: "Invoice amount",
          key: "invoiceAmount",
          className: "invoiceAmount",
          showDownArrow: true
        }, {
          label: "TDS expected",
          key: "expectedTDS",
          className: "expectedTDS",
          showDownArrow: true
        }, {
          label: "Expected amount",
          key: "expectedAmount",
          className: "expectedAmount",
          showDownArrow: true
        }, {
          label: "Amount received till date",
          key: "amountReceivedHistory",
          className: "amountReceivedHistory",
          showDownArrow: true
        }, {
          label: "TDS deducted till date",
          key: "tdsDeductedHistory",
          className: "tdsDeductedHistory",
          showDownArrow: true
        }, {
          label: "Balance",
          key: "balance",
          className: "balance",
          showDownArrow: true
        }, {
          label: "Amt received",
          key: "amountReceived",
          editable: function(record) {
            return record.selected;
          },
          editArgs: {
            editType: "number",
            ngModel: "amountReceivedTemp",
            required: true
          }
        }, {
          label: "TDS deducted",
          key: "tdsDeducted",
          editable: function(record) {
            return record.selected;
          },
          editArgs: {
            editType: "number",
            ngModel: "tdsDeductedTemp",
            required: true
          }
        }],
        actions: [{
          label: "View"
        }],
        selectable: true
      };

      function getPendingTrips() {
        $rootScope.$emit('load-start');
        InvoiceService.getInvoicesPendingPayment().then(function(invoices) {
          $scope.pendingInvoices = invoices;
          $rootScope.$emit('load-stop');
        }, function() {
          $scope.pendingInvoices = [{
            clientCode: "AMZ",
            invoiceNo: "937722",
            invoiceDate: 1332434322,
            invoiceAmount: "1233.34",
            expectedTDS: "200",
            expectedAmount: "1033.34",
            amountReceivedHistory: "200",
            tdsDeductedHistory: "100",
            balance: "933.34"
          }, {
            clientCode: "BDT",
            invoiceNo: "9377552",
            invoiceDate: 133243334,
            invoiceAmount: "20000",
            expectedTDS: "2000",
            expectedAmount: "18000",
            amountReceivedHistory: "2000",
            tdsDeductedHistory: "1000",
            balance: "17000"
          }, {
            clientCode: "AMUL",
            invoiceNo: "923422",
            invoiceDate: 1332987672,
            invoiceAmount: "100000",
            expectedTDS: "20000",
            expectedAmount: "80000",
            amountReceivedHistory: "57000",
            tdsDeductedHistory: "3000",
            balance: "40000"
          }];
          $rootScope.$emit('load-stop');
        });
      }

      function getSelectedInvoices() {
        var invoices = [];
        $scope.pendingInvoices.some(function(obj) {
          if(obj.selected) {
            if(obj.tdsDeductedTemp && obj.amountReceivedTemp) {
              invoices.push(obj);
            } else {
              invoices = [];
              return true;
            }
          }
        });
        return invoices;
      }

      getPendingTrips();

      $scope.settlePayment = function() {
        var selectedInvoices = getSelectedInvoices();
        if(selectedInvoices && selectedInvoices.length > 0) {
    			$rootScope.$emit('show-topDrawer', {
    				template: 'views/dialogs/paymentSettlement.html',
            controller: 'PaymentSettlementController',
            data: {
              invoices: selectedInvoices
            },
    				heading: "Settle payment"
    			});
        }
  		};

    }
  ]);
