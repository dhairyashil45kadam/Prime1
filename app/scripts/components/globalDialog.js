'use strict';
angular.module('financeUiApp')
  .factory("globalDialog", ['ngDialog', '$http', '$templateCache', '$q',
  function (ngDialog, $http, $templateCache, $q) {
    function loadTemplateUrl(tmpl, config) {
      return $http.get(tmpl, (config || {})).then(function(res) {
        return res.data || '';
      });
    }

    function loadTemplate (tmpl) {
      if (!tmpl) {
        return 'Empty template';
      }
      return loadTemplateUrl(tmpl, {cache: $templateCache});
    }

    var _showDialog = function (extraArgs) {
        ngDialog.open({
            templateUrl: 'views/components/globalDialog.html',
            showClose: false,
            closeByDocument: false,
            appendClassName: extraArgs.className || 'topDrawer',
            controller: ['$scope', '$q', '$controller', '$compile',
              function($scope, $q, $controller, $compile) {
                if(!extraArgs) {
                  extraArgs = {};
                }
                $scope.headingText = extraArgs.heading || "Drawer";
                $scope.closeBtnText = extraArgs.closeBtnText || "Close";
                $scope.saveBtnText = extraArgs.saveBtnText || "Save";
                $scope.hideFooter = extraArgs.hideFooter;

                if(extraArgs.template) {
                  $q.all({
                    template: loadTemplate(extraArgs.template)
                  }).then(function(res) {
                    var content = angular.element(res.template);
                    var scope = extraArgs.scope || $scope;
                    if(extraArgs.data) {
                      scope.globalData = extraArgs.data;
                    }
                    if(extraArgs.controller && (angular.isString(extraArgs.controller) || angular.isArray(extraArgs.controller) || angular.isFunction(extraArgs.controller))) {
                      var label;
                      if (extraArgs.controllerAs && angular.isString(extraArgs.controllerAs)) {
                        label = extraArgs.controllerAs;
                      }
                      var controllerInstance = $controller(extraArgs.controller, {
                          $scope: scope,
                          $element: content
                      }, true);
                      content.data('$ngDialogContentControllerController', controllerInstance());
                    }
                    content = $compile(content)(scope);
                    var parentLoadCheck = setInterval(function() {
                      // when template is directly loaded from cache, it takes lesser time and
                      // execution comes here before generating ngDialog template, so at that time,
                      // parentElm will be null, hence executing this in a setInterval
                      var parentElm = document.getElementById('dialog-content');
                      if(parentElm) {
                        angular.element(parentElm).append(content);
                        clearInterval(parentLoadCheck);
                      }
                    }, 200);
                  });
                }

                $scope.close = function() {
                  $scope.closeThisDialog();
                };

                $scope.saveClicked = function() {
                  var result;
                  if($scope.save) {
                    result = $scope.save();     // call the containing controllers save function
                  }
                  if(result !== false) {
                    $q.when(result).then(function(res) {
                      if(res !== false) {
                        if(extraArgs.successCallback) {
                          extraArgs.successCallback();
                        }
                        $scope.closeThisDialog();
                      }
                    }, function() {
                      $scope.closeThisDialog();
                    });
                  }
                };
            }]
        });
    };

    return {
        showDrawer: _showDialog
    };

}]);
