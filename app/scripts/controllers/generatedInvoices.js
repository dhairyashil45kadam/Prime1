'use strict';
angular.module('financeUiApp')
  .controller('GeneratedInvoiceCtrl', ['$rootScope', '$scope', 'InvoiceService', 'ClientService', 'ngDialog', '$filter',
    function ($rootScope, $scope, InvoiceService, ClientService, ngDialog, $filter) {

      $scope.headOpen = true;
      $scope.tabSelected = "APPROVAL_PENDING";

      function truncateValue(a) {
        return $filter('number')(a, 2);
      }

      var commonInvoiceTableData = {
        columns: [{
          label: "Invoice no.",
          key: "invoiceNumber",
          className: "invoiceNumber",
          showDownArrow: true
        }, {
          label: "Client",
          key: "clientCode",
          className: "clientCode",
          showDownArrow: true
        }, {
          label: "Creation date",
          key: "creationDate",
          className: "creationDate",
          showDownArrow: true,
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy');
          }
        }, {
          label: "Invoice amount",
          key: "invoiceAmount",
          formatter: function(value) {
            return truncateValue(value);
          },
          className: "amount",
          showDownArrow: true
        }, {
          label: "Taxes (if applicable)",
          compute: function(record) {
            if(record.serviceTaxAmount || record.sbcTaxAmount || record.kkcTaxAmount) {
              var value = 0;
              value = (+record.serviceTaxAmount) + (+record.sbcTaxAmount) + (+record.kkcTaxAmount);
              return truncateValue(value);
            } else {
              return "N.A.";
            }
          },
          className: "taxes",
          showDownArrow: true
        }, {
          label: "TDS amount",
          key: "tdsAmount",
          formatter: function(value) {
            return truncateValue(value);
          },
          className: "amount",
          showDownArrow: true
        }, {
          label: "Comments",
          key: "comments",
          editable: function(record) {
            return record.selected;
          },
          editArgs: {
            editType: "text",
            ngModel: "comments"
          }
        }],
        showHover: function(record) {
          return $scope.tabSelected !== "APPROVAL_PENDING" && record.comments;
        },
        hover: {
          templateFn: function(record) {
            var templ = "<div>";
            if(record.comments) {
              templ += record.comments;
            }
            templ += '</div>';
            return templ;
          }
        },
        actions: [{
          label: "View",
          action: function(record) {
            $rootScope.$emit('show-topDrawer', {
      				template: 'views/dialogs/invoiceDetails.html',
      				controller: 'InvoiceDetails',
              data: {
                invoice: record
              },
      				heading: "View/print invoice",
              hideFooter: true
      			});
          }
        }],
        selectable: true
      };
      $scope.selectAll = false;

      $scope.invoiceTableData = commonInvoiceTableData;

      function approveOrReject(approved,status) {
        var invoices = {
          bdApprovalTripDtoList: []
        };
        $scope.selectedInvoices.forEach(function(t) {
          if(approved){
            invoices.bdApprovalTripDtoList.push({
              id: t.invoiceId,
              comments: t.comments,
              approved: approved
            });
          }
          else{
            invoices.bdApprovalTripDtoList.push({
              id: t.invoiceId,
              comments: t.comments,
              approved: approved,
              status: status
            });
          }

        });
        var userName = $scope.UserProfile.user_name;
        InvoiceService.approveOrRejectPendingInvoices(invoices,userName).then(function() {
          console.log("Successful");
          $scope.filter();
        }, function() {
          console.log("Unsuccessful");
        });
      }

      function showEnterCommentDialog() {
        if($scope.selectedInvoices && $scope.selectedInvoices.length > 0) {
          var dialog = ngDialog.open({
            templateUrl: 'views/dialogs/enterComment.html',
            appendClassName: 'enterComment',
            scope: $scope,
            closeByDocument: false,
            showClose: false
          });
          dialog.closePromise.then(function (data) {
            if(data.value) {
              $scope.selectedInvoices.forEach(function(t) {                
                t.comments = data.value.split(',')[0];
              });
              approveOrReject(false,data.value.split(',')[1]);             
            }
          });
        }
      }

      var globalButtons = [{
        label: "Approve",
        show: function() {
          return ($scope.tabSelected === "APPROVAL_PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.approveInvoice)));

        },
        action: approveOrReject.bind({}, true)
      }, {
        label: "Reject",
        show: function() {
          if ( ($scope.tabSelected === "APPROVAL_PENDING" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.rejectInvoice)) )
         || ($scope.tabSelected === "APPROVED" && ($scope.UserProfile.$hasAnyRole($scope.PermissionConstant.rejectBDInvoice))) ) {
            return true;
          }
        },
        action: showEnterCommentDialog
      }];

      var tabTableData = {};

      function setTabData() {
        var tab = $scope.tabSelected;
        $scope.invoiceTableData = {};
        $scope.selectedInvoices = [];
        $scope.selectAll = false;
        angular.extend($scope.invoiceTableData, commonInvoiceTableData, tabTableData[tab]);
        var invoices = [];
        $scope.pendingInvoices.forEach(function(obj) {
          if(tab === "APPROVAL_PENDING" && obj.invoiceBillingStatus === "PENDING") {
            invoices.push(obj);
          } else if(tab === "APPROVED" && obj.invoiceBillingStatus === "APPROVED") {
            invoices.push(obj);
          } else if(tab === "REJECTED" && obj.invoiceBillingStatus === "REJECTED") {
            invoices.push(obj);
          }
        });
        $scope.invoiceData = invoices;
      }

      $scope.tabClicked = function(tab) {
        if($scope.tabSelected && $scope.tabSelected === tab) {
          return;
        }
        $scope.tabSelected = tab;
        setTabData();
      };

      $scope.$watch('tabSelected', function() {
        var buttons = [], getType = {};
        globalButtons.forEach(function(o) {
          if(o.show && getType.toString.call(o.show) === '[object Function]') {
            if(!o.show.call({})) {
              return;
            }
          }
          buttons.push(o);
        });
        $scope.buttons = buttons;
      });

      $scope.filter = function() {
        var clientId = $scope.filters.client.id,
          startDate, endDate;

        var filters = [];
        if(clientId) {
          filters.push({
            label: "Client",
            values: [$scope.filters.client.clientName]
          });
        }

        startDate = $scope.filters.fromDate;
        endDate = $scope.filters.toDate;
        if($scope.filters.dateFilter && (startDate || endDate)) {
          var date = "";
          if(startDate) {
            date += startDate.format('DD/MM/YYYY HH:mm') + " - ";
          }
          if(endDate) {
            date += endDate.format('DD/MM/YYYY HH:mm');
          }
          filters.push({
            label: 'Creation date range',
            values: [date]
          });
        }
        $scope.filterValues = filters;
        $scope.headOpen = false;
        $rootScope.$emit('load-start');
        InvoiceService.getInvoicesPendingSettlement(clientId, startDate, endDate).then(function(response) {
          $scope.pendingInvoices = response.object;
          setTabData();
          $rootScope.$emit('load-stop');
        }, function() {
          $scope.pendingInvoices = [{
            id: 1,
            invoiceNumber: "33332",
            invoiceAmount: "324424",
            tdsAmount: "33421",
            creationDate: 1232934674,
            clientCode: "AMZ",
            invoiceBillingStatus: "APPROVAL_PENDING"
          }, {
            id: 1,
            invoiceNumber: "33332",
            invoiceAmount: "324424",
            creationDate: 1232934674,
            clientCode: "AMZ",
            invoiceBillingStatus: "APPROVAL_PENDING"
          }];
          $rootScope.$emit('load-stop');
        });
      };
      $scope.selectedInvoices = [];

    }
  ]);
