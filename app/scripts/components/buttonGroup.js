'use strict';
angular.module("financeUiApp")
    .directive('buttonGroup', function () {

        var controller = ['$rootScope', '$scope', function ($rootScope, $scope) {
          $scope.onButtonClick = function(button) {
            var getType = {},
                value = button.action, params;
            params = angular.extend($scope.extraArgs || {}, button.args || {});
            if(value && getType.toString.call(value) === '[object Function]') {
                return value.call({}, params);
            }
          };

          function createFlyout() {
            var flyoutContainer = document.createElement('div');
            flyoutContainer.className = "flyout-view opened";
            flyoutContainer.style.width = $scope.flyoutWidth + 'px';
            flyoutContainer.style.top = $scope.flyoutTop + 'px';
            var flyout = document.createElement('div');
            flyout.className = 'flyout';
            var flyoutContent = document.createElement('div');
            flyoutContent.className = 'flyout-content';
            var ul = document.createElement('ul');
            $scope.moreButtons.forEach(function(button) {
              var li = document.createElement('li');
              var a = document.createElement('a');
              a.setAttribute('title', button.label);
              a.innerHTML = button.label;
              a.addEventListener('click', function() {
                $scope.onButtonClick(button);
              });
              li.appendChild(a);
              ul.appendChild(li);
            });
            flyoutContent.appendChild(ul);
            flyout.appendChild(flyoutContent);
            flyoutContainer.appendChild(flyout);
            return flyoutContainer;
          }

          $scope.hideFlyout = function(evt) {
            evt.stopPropagation();
            $scope.showFlyout = false;
            var target = evt.target;
            target.classList.toggle("open", false);
            if(target.nextSibling) {
              target.nextSibling.remove();
            }
            // $rootScope.$emit('flyout-close');
          };

          $scope.showMore = function(evt) {
            evt.stopPropagation();
            if($scope.showFlyout) {
              $rootScope.$emit('flyout-close');
              return;
            }
            var target = evt.target;
            $scope.showFlyout = true;
            target.classList.toggle("open", true);
            var parent = evt.target.parentElement,
              rect = parent.getBoundingClientRect();
            $scope.flyoutWidth = rect.width;
            $scope.flyoutTop = rect.height;
            parent.appendChild(createFlyout());
            $rootScope.$emit('flyout-open', {
              hide: function() {
                $scope.hideFlyout(evt);
              },
              zeroOpacity: true
            });
          };

        }];

        function show(obj, args) {
          var getType = {};
          if(!obj.show) {
              return true;
          } else if(obj.show && getType.toString.call(obj.show) === '[object Function]') {
              return obj.show.call({}, args);
          }
          return obj.show;
        }

        return {
            restrict: 'AE',
            scope: {
              extraArgs: "=?",
              dynamicButtons: "=?",
              watchChanges: "=?"
            },
            template: function (element) {
                var template = '<div class="button-group"></div>';
                element.html(template);
            },

            controller: controller,

            link: function ($scope, $element) {

                var buttonsDiv = $element.children()[0];
                function createMainButton(button) {
                  var mainButton = document.createElement('button');
                  mainButton.className = "primary button-group-main";
                  mainButton.setAttribute('title', button.label);
                  mainButton.innerHTML = button.label;
                  mainButton.addEventListener('click', function() {
                    $scope.onButtonClick(button);
                    $scope.$apply();
                  });
                  return mainButton;
                }

                function createToggleButton() {
                  var toggleButton = document.createElement('button');
                  toggleButton.className = 'primary button-group-toggle';
                  // if($scope.showMoreButtons) {
                  //   toggleButton.className += " open";
                  // }
                  toggleButton.addEventListener('click', function(ev) {
                    $scope.showMore(ev);
                  });
                  return toggleButton;
                }

                function showButtons() {
                  var buttons = [];
                  $scope.allButtons.forEach(function(obj) {
                    if(obj.show && !show(obj, $scope.extraArgs)) {
                      return;
                    }
                    buttons.push(obj);
                  });
                  while(buttonsDiv.firstChild) {
                    buttonsDiv.removeChild(buttonsDiv.firstChild);
                  }
                  if(buttons.length !== 0) {
                    buttonsDiv.appendChild(createMainButton(buttons[0]));
                    if(buttons.length > 1) {
                      $scope.moreButtons = buttons.slice(1);
                      buttonsDiv.appendChild(createToggleButton());
                    }
                  }
                }

                $scope.idLabel = $scope.idLabel || "buttonGroup";

                function onButtonsChange() {
                  $scope.hideMoreLink = true;
                  $scope.hideGroup = false;
                  $scope.allButtons = $scope.dynamicButtons || [];
                  if($scope.$parent.buttons) {
                    $scope.allButtons = $scope.$parent.buttons;
                    $scope.extraArgs = $scope.$parent.extraArgs;
                  }
                  showButtons();
                }

                onButtonsChange();
                if($scope.watchChanges) {
                  $scope.$watch('dynamicButtons', onButtonsChange, true);
                }
            }
        };
});
