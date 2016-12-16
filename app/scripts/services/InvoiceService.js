'use strict';
angular.module('financeUiApp')
  .factory('InvoiceService', ['HttpQService', function(HttpQService) {
    return {

      getTripsPendingInvoicing: function(clientId, routeIds, startLocations, endLocations, tripDatesFilter, startDate, endDate) {
        var url = 'tripbillingdetail/getAll?';
        url += 'client=' + clientId;
        if(routeIds && routeIds.length > 0) {
          url += '&routeId=';
          routeIds.forEach(function(routeId, index) {
            if(index !== 0) {
              url += ",";
            }
            url+= routeId;
          });
        }
        if(startLocations && startLocations.length > 0) {
          url += '&startLocation=';
          startLocations.forEach(function(startLocation, index) {
            if(index !== 0) {
              url += ",";
            }
            url+= startLocation;
          });
        }
        if(endLocations && endLocations.length > 0) {
          url += '&endLocation=';
          endLocations.forEach(function(endLocation, index) {
            if(index !== 0) {
              url += ",";
            }
            url+= endLocation;
          });
        }
        if(tripDatesFilter) {
          url += '&tripMilestone=' + tripDatesFilter;
        }
        if(startDate) {
          url += '&startTime=' + startDate;
        }
        if(endDate) {
          url += '&endTime=' + endDate;
        }
        return HttpQService.get(url);
      },

      getInvoicesPendingPayment: function() {
        return HttpQService.get('invoices');
      },

      editTripRates: function(editTrip , userName) {
        return HttpQService.post('tripbillingdetail/edittripbilling?currentUser=' + userName, editTrip);
      },

      askBDApprovalforPendingTrips: function(trips , userName) {
        return HttpQService.post('tripbillingdetail/addtoannnexure?currentUser=' + userName, trips);
      },

      approveOrRejectPendingTrips: function(trips , userName) {
        return HttpQService.post('tripbillingdetail/bd/approve?currentUser=' + userName, trips);
      },

      calculateFuelSurcharge: function(clientId, fuelRate, tripIds ,userName) {
        var url = 'tripbillingdetail/computefuelrate?clientId='+ clientId +'&currentFuelRate=' + fuelRate;
        url += '&currentUser=' + userName;
        return HttpQService.post(url, tripIds);
      },
      createInvoice: function(data,userName) {
        return HttpQService.post('tripinvoicedetail/create?currentUser=' + userName, data);
      },
      createDownloadOptions: function(data) {
        return HttpQService.post('tripinvoicedetail/createDownloadOptions', data);  
      },
      getInvoicesPendingSettlement: function(clientId, invoiceFromDate, invoiceToDate) {
        var url = 'tripinvoicedetail/getall?clientIdList=' + clientId;
        if(invoiceFromDate) {
          url += '&startTime=' + invoiceFromDate;
        }
        if(invoiceToDate) {
          url += '&endTime=' + invoiceToDate;
        }
        url += '&tripInvoiceStatusList=PENDING,REJECTED,APPROVED';
        return HttpQService.get(url);
      },

      getInvoiceSummary: function(invoiceId) {
        return HttpQService.get('tripinvoicedetail/' + invoiceId);
      },
      unassignedCurrentRate: function(planningIdList , userName) {
        return HttpQService.post('tripbillingdetail/unassigncurrentrate?currentUser=' + userName , planningIdList);
      },
      approveOrRejectPendingInvoices: function(invoicesDTO , userName) {
        return HttpQService.put('tripinvoicedetail/update?currentUser='+ userName, invoicesDTO);
      },
      calculateRateByWeight: function(clientId, weight, tripIds , userName) {
        var url = 'tripbillingdetail/computebaseratebyweight?clientId=' + clientId +'&weight=' + weight + '&currentUser=' + userName;
        return HttpQService.post(url,tripIds);
      },
      bulkEditTrip: function(bulkEditTripDTO,userName) {
        console.log(bulkEditTripDTO);
        return HttpQService.post('tripbillingdetail/edittripbillingbulk?currentUser=' + userName , bulkEditTripDTO);
      }
    };
  }]);