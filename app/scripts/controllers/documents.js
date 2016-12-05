'use strict';

angular.module('financeUiApp')
  .controller('DocumentsCtrl', ['$rootScope', '$scope', '$filter',
    function ($rootScope, $scope, $filter) {

      function uploadDocuments() {
        $rootScope.$emit('show-topDrawer', {
  				template: 'views/dialogs/documentsTracking.html',
  				controller: 'DocumentsTracking',
  				heading: "Upload Documents"
  			});
      }

      $scope.documentsTableData = {
        columns: [{
          label: "Client",
          key: "clientCode",
          className: "clientCode",
          showDownArrow: true
        }, {
          label: "Trip code",
          key: "tripCode",
          className: "tripCode",
          showDownArrow: true
        }, {
          label: "Trip start time",
          key: "actualStartTime",
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          },
          className: "actualStartTime",
          showDownArrow: true
        }, {
          label: "Trip close time",
          key: "actualEndTime",
          formatter: function(value) {
            return $filter('date')(value, 'dd/MM/yyyy HH:mm');
          },
          className: "actualEndTime",
          showDownArrow: true
        }, {
          label: "Route",
          key: "vehicleRoute.displayName",
          className: "vehicleRoute",
          showDownArrow: true
        }]
      };
      var tabTableData = {
        'UPLOAD': {
          actions: [{
            label: "Upload",
            action: uploadDocuments
          }],
          showHover: true,
          hover: {
            templateFn: function(record) {
              var templ = "<div>";
              if(!record.podStatus.UPLOAD) {
                templ += "<div class='red'><i class='fa fa-times'></i>";
              } else {
                templ += "<div class='green'><i class='fa fa-check'></i>";
              }
              templ += '<span> POD </span></div>';
              if(!record.lrStatus.UPLOAD) {
                templ += "<div class='red'><i class='fa fa-times'></i>";
              } else {
                templ += "<div class='green'><i class='fa fa-check'></i>";
              }
              templ += '<span> LR </span></div>';
              templ += '<div>';
              return templ;
            }
          }
        },
        'VERIFY': {
          actions: [{
            label: "Verify"
          }],
          showHover: true,
          hover: {
            templateFn: function(record) {
              var templ = "<div>";
              if(!record.podStatus.VERIFY) {
                templ += "<div class='red'><i class='fa fa-times'></i>";
              } else {
                templ += "<div class='green'><i class='fa fa-check'></i>";
              }
              templ += '<span> POD </span></div>';
              if(!record.lrStatus.VERIFY) {
                templ += "<div class='red'><i class='fa fa-times'></i>";
              } else {
                templ += "<div class='green'><i class='fa fa-check'></i>";
              }
              templ += '<span> LR </span></div>';
              templ += '</div>';
              return templ;
            }
          }
        },
        'ACKNOWLEDGE': {
          actions: [{
            label: "Acknowledge"
          }],
          hover: {
            templateFn: function(record) {
              var templ = "<div>";
              if(!record.podStatus.ACKNOWLEDGE) {
                templ += "<div class='red'><i class='fa fa-times'></i>";
              } else {
                templ += "<div class='green'><i class='fa fa-check'></i>";
              }
              templ += '<span> POD </span></div>';
              if(!record.lrStatus.ACKNOWLEDGE) {
                templ += "<div class='red'><i class='fa fa-times'></i>";
              } else {
                templ += "<div class='green'><i class='fa fa-check'></i>";
              }
              templ += '<span> LR </span></div>';
              templ += '</div>';
              return templ;
            }
          }
        }
      };

      $scope.tabClicked = function(tab) {
        if($scope.tabSelected && $scope.tabSelected === tab) {
          return;
        }
        $scope.tabSelected = tab;
        angular.extend($scope.documentsTableData, tabTableData[tab]);
        var trips = [];
        $scope.closedTrips.forEach(function(obj) {
          if(tab === 'UPLOAD') {
            if(!obj.podStatus.UPLOAD || !obj.lrStatus.UPLOAD) {
              trips.push(obj);
            }
          } else {
            var prevState;
            if(tab === 'VERIFY') {
              prevState = 'UPLOAD';
            } else {
              prevState = 'VERIFY';
            }
            if(obj.podStatus[prevState] && obj.lrStatus[prevState] && (!obj.podStatus[tab] || !obj.lrStatus[tab])) {
              trips.push(obj);
            }
          }
        });
        $scope.tripsData = trips;
      };

      function getPendingTrips() {
        $scope.closedTrips = [
         {
            "id":1225172,
            "clientCode":"BDT",
            "tripCode":"2015|2210|BDT|PTD-AHMD|1225172",
            "createdBy":"param",
            "startedBy":null,
            "closedBy":null,
            "placementTime":"23:00:00",
            "availableSince":1445403600000,
            "placementDate":1445385600000,
            "dispatchTime":"04:00:00",
            "vehicleType":"22",
            "remarks":null,
            "routeId":21,
            "vehicleRoute":{
               "id":21,
               "routeName":"PTD-AHMD",
               "tat":18,
               "via":null,
               "totalDistance":"949",
               "twentyTwoFtTollAdv":3300,
               "thirtyTwoFtTollAdv":0,
               "isActive":false,
               "updatedBy":null,
               "lastUpdatedOn":null,
               "displayName":"PTD-AHMD"
            },
            "status":"CLOSED",
            "recommended":false,
            "updatedTime":1445648506000,
            "actualStartTime":1445520960000,
            "actualEndTime":1445594820000,
            "manualStartTime":null,
            "manualCloseTime":null,
            "tat":17,
            "inHub":false,
            "startTime":null,
            "endTime":null,
            "actPlacementTime":1445513760000,
            "vehicleNo":"HR55W3756",
            "vehicle":{
               "vehicleNo":"HR55W3756",
               "model":null,
               "isActive":false,
               "owner":null,
               "type":"22",
               "createdBy":null,
               "updatedBy":"Negi",
               "underMaintenance":true,
               "client":null,
               "route":null,
               "kmsTravelledAfterLastService":0,
               "businessOwner":null,
               "lastServicedDate":null,
               "vehicleMaintenanceReason":"OTHERS",
               "state":"ACCIDENT",
               "mileage":10.0,
               "businessOwnerId":null,
               "vehicleType":"TYPE_22",
               "fuelSensorStatus":"NOT_INSTALLED",
               "chassisNumber":null,
               "engineNumber":null,
               "lastUpdatedOn":1457459138000,
               "container":false,
               "upregistered":false,
               "underMaintenanceReason":"OTHERS"
            },
            "totalDistance":949.0,
            "delay":0,
            "updatedBy":"param",
            "inCwh":false,
            "cwhWaitingTime":0,
            "schedulePlanId":143,
            "schedulePlan":{
               "id":143,
               "client":"BDT",
               "routeId":21,
               "route":{
                  "id":21,
                  "routeName":"PTD-AHMD",
                  "tat":18,
                  "via":null,
                  "totalDistance":"949",
                  "twentyTwoFtTollAdv":3300,
                  "thirtyTwoFtTollAdv":0,
                  "isActive":false,
                  "updatedBy":null,
                  "lastUpdatedOn":null,
                  "displayName":"PTD-AHMD"
               },
               "placementTime":"23:00:00",
               "standaredTimeOfDipature":"04:00:00",
               "standaredTimeOfArrival":"22:00:00",
               "turnAroundTime":18,
               "vehicleType":"22",
               "startPointId":141,
               "lastUpdatedOn":null,
               "startCWH":{
                  "id":141,
                  "city":"PTD3",
                  "code":"BDT",
                  "latitude":28.5503770,
                  "longitude":77.1084800,
                  "remarks":"BDT Airport - 22ft",
                  "service":"Dheer Singh\t9810793830 and Piyush\t9711395658",
                  "name":"Airport (DOH), Delhi",
                  "updatedBy":null,
                  "lastUpdatedOn":null,
                  "hubId":null,
                  "hubObj":null,
                  "client":{
                     "id":4,
                     "code":"BDT",
                     "clientName":"Bluedart",
                     "businessOwner":"ABHISHEK",
                     "updatedBy":null,
                     "clientType":"DRY",
                     "lastUpdatedOn":null,
                     "businessOwnerId":1,
                     "busOwner":null
                  }
               },
               "endPointId":117,
               "endCWH":{
                  "id":117,
                  "city":"AMDC1",
                  "code":"BDT",
                  "latitude":23.0744880,
                  "longitude":72.6188260,
                  "remarks":null,
                  "service":"Pankaj Shourie",
                  "name":"Ahmedabad",
                  "updatedBy":null,
                  "lastUpdatedOn":null,
                  "hubId":202,
                  "hubObj":{
                     "id":202,
                     "city":"Ahmedabad",
                     "gpsCode":"1",
                     "hubCode":"AMDC1",
                     "latitude":23.0492550,
                     "longitude":72.5642900,
                     "hubAvailable":false,
                     "pilotAvailable":true,
                     "state":"Gujrat",
                     "sequence":0,
                     "isActive":true,
                     "updatedBy":"NULL",
                     "lastUpdatedOn":1459771214000,
                     "zoneAvailable":true
                  },
                  "client":{
                     "id":4,
                     "code":"BDT",
                     "clientName":"Bluedart",
                     "businessOwner":"ABHISHEK",
                     "updatedBy":null,
                     "clientType":"DRY",
                     "lastUpdatedOn":null,
                     "businessOwnerId":1,
                     "busOwner":null
                  }
               },
               "isActive":false,
               "updatedBy":null,
               "tripType":null
            },
            "podStatus":{
              'UPLOAD': true,
              'VERIFY': true,
              'ACKNOWLEDGE': false
            },
            "lrStatus":{
              'UPLOAD': true,
              'VERIFY': true,
              'ACKNOWLEDGE': false
            },
            "podNumber":null,
            "actualTime":0,
            "clientRouteLabel":null,
            "updatedTimeView":null,
            "sendUnloadMail":false,
            "actualPlanningTime":null,
            "placementAssuranceTime":null,
            "commodityId":null,
            "tripType":null,
            "routeEndPoints":"PTD-AHMD",
            "active":true
         },
         {
            "id":1341541,
            "clientCode":"AMZ",
            "tripCode":"2015|3110|AMZ|AHMD-BNG|1341541",
            "createdBy":"kuldeep",
            "startedBy":null,
            "closedBy":null,
            "placementTime":"13:00:00",
            "availableSince":null,
            "placementDate":1446249600000,
            "dispatchTime":"16:00:00",
            "vehicleType":"22",
            "remarks":null,
            "routeId":29,
            "vehicleRoute":{
               "id":29,
               "routeName":"AHMD-BNG",
               "tat":28,
               "via":null,
               "totalDistance":"1524",
               "twentyTwoFtTollAdv":7800,
               "thirtyTwoFtTollAdv":0,
               "isActive":false,
               "updatedBy":null,
               "lastUpdatedOn":1458921523000,
               "displayName":"AHMD-BNG"
            },
            "status":"CLOSED",
            "recommended":false,
            "updatedTime":1446423969000,
            "actualStartTime":1446309720000,
            "actualEndTime":1446379191000,
            "manualStartTime":null,
            "manualCloseTime":null,
            "tat":28,
            "inHub":false,
            "startTime":null,
            "endTime":null,
            "actPlacementTime":1446302520000,
            "vehicleNo":"HR55V7031",
            "vehicle":{
               "vehicleNo":"HR55V7031",
               "model":null,
               "isActive":false,
               "owner":null,
               "type":"22",
               "createdBy":null,
               "updatedBy":"krishankumar",
               "underMaintenance":true,
               "client":null,
               "route":null,
               "kmsTravelledAfterLastService":0,
               "businessOwner":null,
               "lastServicedDate":null,
               "vehicleMaintenanceReason":"ACCIDENT",
               "state":"ACCIDENT",
               "mileage":10.0,
               "businessOwnerId":null,
               "vehicleType":"TYPE_22",
               "fuelSensorStatus":"NOT_INSTALLED",
               "chassisNumber":null,
               "engineNumber":null,
               "lastUpdatedOn":1457459133000,
               "container":false,
               "upregistered":false,
               "underMaintenanceReason":"ACCIDENT"
            },
            "totalDistance":1524.0,
            "delay":-135,
            "updatedBy":"kuldeep",
            "inCwh":false,
            "cwhWaitingTime":0,
            "schedulePlanId":null,
            "schedulePlan":null,
            "podStatus":{
              'UPLOAD': true,
              'VERIFY': false,
              'ACKNOWLEDGE': false
            },
            "lrStatus":{
              'UPLOAD': false,
              'VERIFY': false,
              'ACKNOWLEDGE': false
            },
            "podNumber":null,
            "actualTime":0,
            "clientRouteLabel":null,
            "updatedTimeView":null,
            "sendUnloadMail":false,
            "actualPlanningTime":null,
            "placementAssuranceTime":null,
            "commodityId":null,
            "tripType":null,
            "routeEndPoints":"AHMD-BNG",
            "active":true
         },
         {
            "id":1341650,
            "clientCode":"AMZ",
            "tripCode":"2015|111|AMZ|HYD-PTD|1341650",
            "createdBy":"krishankumar",
            "startedBy":null,
            "closedBy":null,
            "placementTime":"00:00:00",
            "availableSince":1446361200000,
            "placementDate":1446422400000,
            "dispatchTime":"16:00:00",
            "vehicleType":"22",
            "remarks":null,
            "routeId":16,
            "vehicleRoute":{
               "id":16,
               "routeName":"HYD-PTD",
               "tat":36,
               "via":"INDR,BHL",
               "totalDistance":"1724",
               "twentyTwoFtTollAdv":3900,
               "thirtyTwoFtTollAdv":8100,
               "isActive":false,
               "updatedBy":null,
               "lastUpdatedOn":null,
               "displayName":"HYD-PTD(via INDR,BHL)"
            },
            "status":"CLOSED",
            "recommended":true,
            "updatedTime":1446525946000,
            "actualStartTime":1446384780000,
            "actualEndTime":1446524160000,
            "manualStartTime":null,
            "manualCloseTime":null,
            "tat":45,
            "inHub":false,
            "startTime":null,
            "endTime":null,
            "actPlacementTime":1446377580000,
            "vehicleNo":"HR55V1411",
            "vehicle":{
               "vehicleNo":"HR55V1411",
               "model":"BOSS 1212",
               "isActive":true,
               "owner":null,
               "type":"22",
               "createdBy":null,
               "updatedBy":"randhir",
               "underMaintenance":false,
               "client":null,
               "route":null,
               "kmsTravelledAfterLastService":0,
               "businessOwner":"KSHITIJ",
               "lastServicedDate":null,
               "vehicleMaintenanceReason":null,
               "state":null,
               "mileage":10.0,
               "businessOwnerId":null,
               "vehicleType":"TYPE_22",
               "fuelSensorStatus":"NOT_INSTALLED",
               "chassisNumber":null,
               "engineNumber":null,
               "lastUpdatedOn":null,
               "container":false,
               "upregistered":true,
               "underMaintenanceReason":null
            },
            "totalDistance":0.0,
            "delay":81,
            "updatedBy":"executive",
            "inCwh":false,
            "cwhWaitingTime":0,
            "schedulePlanId":184,
            "schedulePlan":{
               "id":184,
               "client":"AMZ",
               "routeId":16,
               "route":{
                  "id":16,
                  "routeName":"HYD-PTD",
                  "tat":36,
                  "via":"INDR,BHL",
                  "totalDistance":"1724",
                  "twentyTwoFtTollAdv":3900,
                  "thirtyTwoFtTollAdv":8100,
                  "isActive":false,
                  "updatedBy":null,
                  "lastUpdatedOn":null,
                  "displayName":"HYD-PTD(via INDR,BHL)"
               },
               "placementTime":"00:00:00",
               "standaredTimeOfDipature":"16:00:00",
               "standaredTimeOfArrival":"13:00:00",
               "turnAroundTime":45,
               "vehicleType":"22",
               "startPointId":6,
               "lastUpdatedOn":null,
               "startCWH":{
                  "id":6,
                  "city":"HYDF",
                  "code":"AMZ",
                  "latitude":17.2482389,
                  "longitude":78.3735941,
                  "remarks":"Beside Oyster Airport Hotel/Right side after crossing Bangalore ORR Toll towards Bangalore Highway",
                  "service":"Zaqir - 9059718889 | Narendra Singam - 9963177572",
                  "name":"HYDF",
                  "updatedBy":null,
                  "lastUpdatedOn":null,
                  "hubId":210,
                  "hubObj":{
                     "id":210,
                     "city":"Hyderabad",
                     "gpsCode":"9",
                     "hubCode":"HYDP1",
                     "latitude":17.2632350,
                     "longitude":78.3775250,
                     "hubAvailable":true,
                     "pilotAvailable":true,
                     "state":"Andhra pradesh",
                     "sequence":0,
                     "isActive":true,
                     "updatedBy":"NULL",
                     "lastUpdatedOn":1457360400000,
                     "zoneAvailable":false
                  },
                  "client":{
                     "id":1,
                     "code":"AMZ",
                     "clientName":"Amazon",
                     "businessOwner":"ABHISHEK",
                     "updatedBy":null,
                     "clientType":"DRY",
                     "lastUpdatedOn":null,
                     "businessOwnerId":1,
                     "busOwner":null
                  }
               },
               "endPointId":10,
               "endCWH":{
                  "id":10,
                  "city":"DELU",
                  "code":"AMZ",
                  "latitude":28.3902038,
                  "longitude":76.9422298,
                  "remarks":"MANESAR, Near Lavanya Apartments, Nawada Village,Sector 81, Gurgaon, Haryana, India",
                  "service":"Sunil - 8698316311 (day) | Ajit (night)",
                  "name":"DELU",
                  "updatedBy":null,
                  "lastUpdatedOn":null,
                  "hubId":213,
                  "hubObj":{
                     "id":213,
                     "city":"PATAUDI",
                     "gpsCode":"SA",
                     "hubCode":"DELP1",
                     "latitude":28.2816183,
                     "longitude":76.8530716,
                     "hubAvailable":true,
                     "pilotAvailable":true,
                     "state":"Haryana",
                     "sequence":0,
                     "isActive":true,
                     "updatedBy":"NULL",
                     "lastUpdatedOn":1457360400000,
                     "zoneAvailable":true
                  },
                  "client":{
                     "id":1,
                     "code":"AMZ",
                     "clientName":"Amazon",
                     "businessOwner":"ABHISHEK",
                     "updatedBy":null,
                     "clientType":"DRY",
                     "lastUpdatedOn":null,
                     "businessOwnerId":1,
                     "busOwner":null
                  }
               },
               "isActive":false,
               "updatedBy":null,
               "tripType":null
            },
            "podStatus":{
              'UPLOAD': true,
              'VERIFY': false,
              'ACKNOWLEDGE': false
            },
            "lrStatus":{
              'UPLOAD': true,
              'VERIFY': true,
              'ACKNOWLEDGE': false
            },
            "podNumber":null,
            "actualTime":0,
            "clientRouteLabel":null,
            "updatedTimeView":null,
            "sendUnloadMail":false,
            "actualPlanningTime":null,
            "placementAssuranceTime":null,
            "commodityId":null,
            "tripType":null,
            "routeEndPoints":"HYD-PTD",
            "active":true
         }
      ];
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
