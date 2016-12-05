'use strict';
angular.module('financeUiApp')
  .factory('ClientService', ['HttpQService', function(HttpQService) {
    return {

      getAllClients: function() {
          return HttpQService.get('client');
      },

      getClientsWithFinancialInfo: function(financePending,userName) {
        var url = 'client?financePending=';
        if(financePending) {
          url = url.concat('true');
        } else {
          url = url.concat('false');
        }
        url = url.concat('&currentuser=' + userName);
        if (userName) {
        return HttpQService.get(url);
      }
      },

      getClientBillingDetails: function(clientId) {
        return HttpQService.get('client/' + clientId + '/clientbillingdetail/all');
      },

      getClientWarehouses: function(clientId) {
        var url = 'client/' + clientId + '/warehouse';
        return HttpQService.get(url);
      },

      getClientRoutes: function(clientId) {
        var url = 'client/' + clientId + '/clientroute';
        return HttpQService.get(url);
      },

      getRatesForClientRoute: function(clientId, clientRouteId) {
        var url = 'client/' + clientId + '/clientroutebillingdetail?clientrouteid='+ clientRouteId;
        return HttpQService.get(url);
      },

      getRoutesForClient: function(clientId, status) {
        var url = 'client/' + clientId + '/clientroutebillingdetail/all?statusList=' + status;
        return HttpQService.get(url);
      },

      getNonAddedRoutesForClient: function(clientId) {
        var url = 'client/' + clientId + '/clientroutebillingdetail/all?statusList';
        return HttpQService.get(url);
      },

      getClientsDetails: function(userName) {
        return HttpQService.get('client/billingdetail?currentuser=' + userName);
      },

      saveClientRouteBillingDetails: function(clientId, clientRouteId,userName,rateDetails) {
        var url = 'client/' + clientId + '/clientroutebillingdetail?clientrouteid='+ clientRouteId;
        url += '&currentUser=' + userName;
        return HttpQService.post(url,rateDetails);
      },

      changeRouteBillingDetails: function(clientId, clientRouteRateId,currentUser,rateDetails) {
        var url = 'client/' + clientId + '/clientroutebillingdetail/'+ clientRouteRateId;
        url += '/update?currentUser=' + currentUser;
        return HttpQService.put(url,rateDetails);
      },
      changeRouteApprovalDetails: function(clientId, clientRouteRateId,userName, rates) {
        var url = 'client/' + clientId + '/clientroutebillingdetail/'+ clientRouteRateId + '/approve?currentUser=' + userName;
        return HttpQService.put(url, rates);
      },
      changeRouteRejectDetails: function(clientId, clientRouteRateId,userName, rates) {
        var url = 'client/' + clientId + '/clientroutebillingdetail/'+ clientRouteRateId + '/approve?currentUser=' + userName;
        return HttpQService.put(url, rates);
      },
      changeRouteRejectDetailsForApproved: function(clientId, clientRouteRateId,userName, rates) {
        var url = 'client/' + clientId + '/clientroutebillingdetail/'+ clientRouteRateId + '/reject/approved?currentUser=' + userName;
        return HttpQService.put(url, rates);
      },
      changeClientApprovalDetails: function(clientId, clientRouteRateId,userName, rates) {
        var url = 'client/' + clientId + '/clientbillingdetail/'+ clientRouteRateId + '/approve?currentUser=' + userName;
        return HttpQService.put(url, rates);
      },

      getBillingAddresses: function(clientId) {
        var url = 'client/' + clientId + '/clientcontactdetail?clientcontactpersontype=BILLING';
        return HttpQService.get(url);
      },

      getClientRouteBillingDocument: function(clientId,referenceId) {
        var url = 'client/' + clientId + '/clientbillingdocument/referencedocument?referenceId=' + referenceId;
        return HttpQService.get(url);
      },

      addClientAddress: function(clientId, address , userName) {
        var url = 'client/' + clientId + '/clientcontactdetail';
        if(address.id) {
          url += '/' + address.id;
          url += '?currentUser=' + userName;
           return HttpQService.put(url, address);
        } else {
          url += '?currentUser=' + userName;
          return HttpQService.post(url, address);
        }
      },

      getBillingDetails: function(clientId) {
        var url = 'client/' + clientId + '/clientbillingdetail';
        return HttpQService.get(url);
      },

      saveClientBillingDetails: function(clientId, clientbillingdetails,userName) {
        var url = 'client/' + clientId + '/clientbillingdetail';
        url += '?currentUser=' + userName;
        return HttpQService.post(url, clientbillingdetails);
      },
      getAllHubs: function() {
        return HttpQService.get('client/hub');
      },
      getRouteWithSpecifiedSequence: function(sequence) {
        return HttpQService.get('client/route/' + sequence);
      },
      getContractFiles: function(documentClientType , clientId) {
        return HttpQService.get('client/' + clientId + '/clientbillingdocument?documentclienttype=' + documentClientType);
      },
      addContractFile: function(formData , clientId) {
        return HttpQService.postMeta('client/' + clientId + '/clientbillingdocument' , formData);
      },
      deleteContractFile: function(clientId , clientBillingDocumentId)  {
        return HttpQService.delete('client/' + clientId + '/clientbillingdocument/' + clientBillingDocumentId);
      },
      getTripBillingDetail: function(clientId , planningId) {
        return HttpQService.get('tripbillingdetail/trip?clientId=' + clientId + '&planningId=' + planningId );
      },
      saveSupplementTrip: function(supplementTrip) {
        return HttpQService.post('tripbillingdetail/createsupplementtrip' ,supplementTrip );
      },
      getFuelSurchargeByClientRouteBillingId: function(clientId, fuelRate, clientRouteBillingId){
        return HttpQService.post('/tripbillingdetail/computefuelratebyclientroute?clientId='
                              +clientId+'&currentFuelRate='+fuelRate.value+'&clientRouteBillingId='+clientRouteBillingId);
      }
    };
  }]);
