'use strict';
angular.module('financeUiApp').directive('imageZoom', function () {
    return {
      restrict: "A",
      link: function (scope, elem) {
        var template = '<div id="zoomWrapper" style="display:none"><img src=""><a class="imgClose">x</a></div>';
        if(!document.getElementById("zoomWrapper")) {
          $('body').append(template);
        }
        $(elem).click(function(){
          $('#zoomWrapper').find('img').attr('src', $(elem).attr('src'));
          $('#zoomWrapper').css('display', 'block');
        });
        $(document).on('click', '.imgClose', function(){
          $('#zoomWrapper').css('display', 'none');
        });
      }
    };
  });

  angular.module('financeUiApp').directive('focusInput', function () {
    return {
      restrict: "A",
      link: function (scope, elem) {
        $(elem).click(function(){
          $(elem).prev().trigger('focus');
        });
      }
    };
  });

  angular.module("financeUiApp").directive('editPencil', ['$document',
  function () {
    return {
      restrict: 'E',
      template: '<a class="editForm link" ng-click="toggleButton()" ><i class="fa fa-pencil" ng-show="!isEdit"></i><i class="fa fa-remove" ng-show="isEdit"></i></a>',

      scope: {
        isEdit: "="
      },

      link: function ($scope) {
        $scope.toggleButton = function(){
          $scope.isEdit = !$scope.isEdit;
        };
      }
    };
  }]);

  angular.module("financeUiApp").directive("showErrors", function() {
    return {
      restrict: 'A',
      require: '^form',
      link: function(scope, elm, attr, form) {
        var inputNode, ngInputNode, nameAttr;
        inputNode = elm[0].querySelector("[name]");
        ngInputNode = angular.element(inputNode);

        nameAttr = ngInputNode.attr("name");

        ngInputNode.bind('blur', function() {
          elm.toggleClass("has-error", form[nameAttr].$invalid);
        });

      }
    };
  });