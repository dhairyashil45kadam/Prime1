'use strict';

/**
 * @ngdoc function
 * @name financeUiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the financeUiApp
 */
angular.module('financeUiApp')
.controller('MainCtrl',[ '$rootScope', '$scope', 'globalDialog', 'ClientService', 'PermissionConstant', 'UserProfileFactory',
	function ($rootScope, $scope, globalDialog, ClientService, PermissionConstant, UserProfileFactory) {
		$scope.flyoutArgs = {};
		$scope.showManageOptions = false;
		$scope.showReportOptions = false;
		$scope.UserProfile = UserProfileFactory.$$state.value;
		$scope.PermissionConstant = PermissionConstant;
		$scope.userName = $scope.UserProfile.user_name;

		$scope.UserNameCreation = function()  {

			var arr = [];
			arr = $scope.userName.split(".");
			var idx = arr[1].indexOf('@');
			if (idx >= 0) {
			arr[1] = arr[1].slice(0 ,idx);
			arr[1] = arr[1].charAt(0).toUpperCase() + arr[1].slice(1);
			arr[0] = arr[0].charAt(0).toUpperCase() + arr[0].slice(1);
			$scope.firstName = arr[0];
			$scope.lastName = arr[1];
		}
		};
		$scope.UserNameCreation();

		$scope.toggle = function() {
			$scope.showManageOptions = !$scope.showManageOptions;
		};

		$scope.toggleReports = function() {
			$scope.showReportOptions = !$scope.showReportOptions;
		};

		$rootScope.$on('load-start', function() {
			$scope.showLoading = true;
		});

		$rootScope.$on('load-stop', function() {
			$scope.showLoading = false;
		});

		/**
		*	flyout is impelemented such that only one flyout can be open at any time.
		*/
		$rootScope.$on('flyout-open', function(ev, args) {
			//check whether a flyout is already open, if yes close that first
			if($scope.flyoutOverlay) {
				$scope.hideFlyout();
			}
			$scope.flyoutArgs = args;
			$scope.zeroOpacity = args.zeroOpacity;    // if you dont want your flyout to hide clicking/scrolling of other elements, sets zIndex to -1 and opacity 0
			$scope.flyoutOverlay = true;
		});

		$rootScope.$on('flyout-close', function() {
			if($scope.flyoutOverlay) {
				$scope.hideFlyout();
			}
			$scope.flyoutArgs = {};
			$scope.flyoutOverlay = false;
		});

		$scope.hideFlyout = function() {
			if($scope.flyoutArgs.hide) {
				$scope.flyoutArgs.hide.call();
			}
			$scope.flyoutOverlay = false;
		};

		$scope.openCloseCreateMenu = function(evt) {
			evt.stopPropagation();
			$scope.createOpen = !$scope.createOpen;
			if($scope.createOpen) {
				$rootScope.$emit('flyout-open', {
					hide: function() {
						$scope.createOpen = false;
					}
				});
			} else {
				$rootScope.$emit('flyout-close');
			}
		};

		$rootScope.$on('show-tooltip', function(event, args) {
			$scope.tooltipTemplate = args.template;
			$scope.tooltipStyle = {
				top: args.top,
				left: args.left
			};
			$scope.showTooltip = true;
		});

		$rootScope.$on('hide-tooltip', function() {
			$scope.showTooltip = false;
			$scope.tooltipTemplate = "";
		});

		$rootScope.$on('show-topDrawer', function(event, args) {
			
			args.className = "topDrawer";
			globalDialog.showDrawer(args);
		});

		$rootScope.$on('show-topDrawer-child', function(event, args) {
			
			args.className = "topDrawer";
			globalDialog.showDrawerChild(args);
		});

		$rootScope.$on('show-leftDrawer', function(event, args) {
			args.className = "leftDrawer";
			globalDialog.showDrawer(args);
		});

		$scope.addClient = function() {
			$rootScope.$emit('show-topDrawer', {
				template: 'views/dialogs/createClient.html',
				controller: 'ClientController',
				heading: "Add Client"
			});
		};

		$scope.addRoute = function() {
			$rootScope.$emit('show-topDrawer', {
				template: 'views/dialogs/routeDetails.html',
				controller: 'RoutesController',
				heading: "Add new route"
			});
		};
		$scope.addSupplementaryTrip = function() {
			$rootScope.$emit('show-topDrawer', {
				template: 'views/dialogs/supplementaryTrip.html',
				controller: 'SupplementaryTripController',
				heading: "Add supplementary trip"
			});
		};

		$scope.globalClickHandler = function() {
			//generic click handler
			$rootScope.$emit('flyout-close');
		};

		// common API calls
		ClientService.getAllHubs().then(function(hubs) {
			$rootScope.hubs = hubs;
		});

		ClientService.getClientsWithFinancialInfo(false,$scope.userName).then(function(clients) {
			$rootScope.clients = clients;
		}, function() {
			
		});

		function getValue(obj, column) {
			var getType = {},
			value = "";
			if(column.key) {
				var key = column.key,
				nestedKeys = key.split(".");
				value = obj[nestedKeys[0]];
				if(nestedKeys.length > 1) {
				  value = obj;
				  nestedKeys.forEach(function(k) {
				    if(value) {
				      value = value[k];
				    } else {
				      value = "";
				    }
				  });
				}
			} else if(column.compute) {
				if(getType.toString.call(column.compute) === '[object Function]') {
				  value = column.compute.call({}, obj);
				}
			}
			if(!column.formatter) {
			  return value;
			} else if(getType.toString.call(column.formatter) === '[object Function]') {
			  return column.formatter.call({}, value, column);
			}
		}

    function getBOLDen(colName) {
    	var origMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '/', '.'];
    	var bolded = ['𝐚', '𝐛', '𝐜', '𝐝', '𝐞', '𝐟', '𝐠', '𝐡', '𝐢', '𝐣', '𝐤', '𝐥', '𝐦', '𝐧', '𝐨', '𝐩', '𝐪', '𝐫', '𝐬', '𝐭', '𝐮', '𝐯', '𝐰', '𝐱', '𝐲', '𝐳', '𝐀', '𝐁', '𝐂', '𝐃', '𝐄', '𝐅', '𝐆', '𝐇', '𝐈', '𝐉', '𝐊', '𝐋', '𝐌', '𝐍', '𝐎', '𝐏', '𝐐', '𝐑', '𝐒', '𝐓', '𝐔', '𝐕', '𝐖', '𝐗', '𝐘', '𝐙', '𝟎', '𝟏', '𝟐', '𝟑', '𝟒', '𝟓', '𝟔', '𝟕', '𝟖', '𝟗', ' ', '/', '.'];	
    	var oldLetters = colName.split('');
    	var newColName = "";
    	for(var i = 0; i < oldLetters.length; i++) {
    		newColName += bolded[origMap.indexOf(oldLetters[i])];
    	}
    	return newColName;
    }

		$rootScope.JSONToCSVConvertor = function(JSONData, name, columns) {
 	      var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
 	      var headerRow = '';
 	      var headerRowPlain = '';
 	      var CSV = '';
 	      var metaData = '';
 	      var tripCode = (name.split('_')[1]);
 	      if(tripCode)
 	  	    metaData += tripCode + '\r\n';
 	  	  var clientName = name.split('_')[0];
 	  	  if(clientName)
 	  	  	metaData += clientName + '\r\n\n';
 	      var row = "", headers = [];
          var index, i;

 	      if(columns) {
					for (i = 0;i < columns.length;i++) {
						headerRow += getBOLDen(columns[i].label) + ',';
						headerRowPlain += columns[i].label + ',';
						headers.push(columns[i]);
					}
 	      } else {
					for (index in arrData[0]) {
						headerRow += index + ',';
						headers.push(index);
					}
 	      }
 	      headerRow = headerRow.slice(0, -1);
		  CSV += '\r\n';

		  for (i = 0; i < arrData.length; i++) {
 	        row = "";
 	        for (var k = 0; k < headers.length; k++) {

 	          row += '"' + getValue(arrData[i], headers[k]) + '",';
 	        }
 	        row.slice(0, row.length - 1);
 	        CSV += row + '\r\n';
 	      }

 	      if (CSV === '') {
 	        return;
 	      }

 	      var fileName = name;
 	      var uri = 'data:text/csv;charset=utf-8,' + window.escape(metaData) + headerRowPlain + window.escape(CSV);
 	      var link = document.createElement("a");
 	      link.href = uri;
 	      link.style.visibility = "hidden";
 	      link.download = fileName + ".csv";
 	      document.body.appendChild(link);
 	      link.click();
 	      document.body.removeChild(link);
 	    };
	}]);
