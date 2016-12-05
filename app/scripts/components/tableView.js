'use strict';
angular.module("financeUiApp")
    .directive('tableView', ['$rootScope', '$compile', '$filter', function ($rootScope, $compile, $filter) {

        var controller = ['$scope',
          function ($scope) {
          $scope.showTooltip = function(ev, pageData, row) {
            ev.preventDefault();
            if(pageData.showHover) {
              var getType = {};
              if(getType.toString.call(pageData.showHover) === '[object Function]') {
                if(!pageData.showHover.call({}, row)) {
                  return;
                }
              }
              var args = {
                top: ev.clientY + "px",
                left: ev.clientX + "px",
                template: pageData.hover.templateFn.call({}, row)
              };
              $rootScope.$emit('show-tooltip', args);
            }
          };

          $scope.hideTooltip = function(ev, pageData, row) {
            ev.preventDefault();
            if(pageData.showHover) {
              var getType = {};
              if(getType.toString.call(pageData.showHover) === '[object Function]') {
                if(!pageData.showHover.call({}, row)) {
                  return;
                }
              }
              $rootScope.$emit('hide-tooltip');
            }
          };

          function show(obj, args) {
            var getType = {};
            if(!obj.show) {
                return true;
            } else if(obj.show && getType.toString.call(obj.show) === '[object Function]') {
                return obj.show.call({}, args);
            }
            return obj.show;
          }

          $scope.showColumn = function(column) {
              return show(column);
          };

          $scope.showColumnValue = function(column, record) {
            var getType = {},
                value = "";
            if(column.key) {
              var key = column.key,
                nestedKeys = key.split(".");
              value = record[nestedKeys[0]];
              if(nestedKeys.length > 1) {
                value = record;
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
                value = column.compute.call({}, record);
              }
            }
            if(!column.formatter) {
                return value;
            } else if(getType.toString.call(column.formatter) === '[object Function]') {
                return column.formatter.call({}, value, record);
            }
          };

          $scope.isEditable = function(column, record) {
            var getType = {};
            if(!column.editable) {
              return false;
            } else if(getType.toString.call(column.editable) === '[object Function]'){
              return column.editable.call({}, record);
            } else {
              return column.editable;
            }
          };

          $scope.addSelected = function(record, selected) {
            if(selected === undefined) {
              record.selected = !record.selected;
            }
            if(!$scope.selectedRecords) { $scope.selectedRecords = []; }
            var index = _.findIndex($scope.selectedRecords, function(o) {  return o.id === record.id; });
            if(record.selected && index === -1) {
              $scope.selectedRecords.push(record);
            } else if(!record.selected && index !== -1){
              $scope.selectedRecords.splice(index, 1);
            }
          };

          $scope.addAllSelected = function() {
            $scope.selectAll = !$scope.selectAll;
            var filteredList = $filter('filter')($scope.data, $scope.filterBy);
            filteredList.forEach(function(o) {
              o.selected = $scope.selectAll;
              $scope.addSelected(o, true);
            });
          };

          $scope.inputChanged = function(ev, onChange) {
            var getType = {};
            if(onChange && getType.toString.call(onChange) === '[object Function]') {
                onChange.call({});
            }
          };

        }];

        function hasValue(a) {
          return a || a===0;
        }

        return {
            restrict: 'E',
            scope: {
                pageData: "=",
                data: "=",
                filterBy: "=",
                selectedRecords: "=",
                selectAll: "=?"
            },
            template: function (element) {
                var template = '<div class="greenHeader"></div>';
                element.html(template);
            },

            controller: controller,

            link: function ($scope, $element) {

                var tableDiv = $element.children()[0];
                var scope = $scope;
                $scope.options = {
                    "noDataMessage": "No data available"
                };

                function createSerialNoColumn(obj, i, pageData) {
                  var sno = document.createElement('td');
                  sno.className = "sno";
                  if(pageData.selectable) {
                    var selectable = document.createElement('span');
                    var inputCheckBox = document.createElement('input');
                    inputCheckBox.className = 'checkbox';
                    inputCheckBox.setAttribute('type', 'checkbox');
                    inputCheckBox.setAttribute('id', 'checkbox' + i);
                    if(obj.selected) {
                      inputCheckBox.value = true;
                      inputCheckBox.checked = true;
                    }
                    inputCheckBox.addEventListener('change', function(ev) {
                      $scope.addSelected(obj);
                      $scope.$apply();
                    });
                    var label = document.createElement('label');
                    label.className = 'index';
                    label.setAttribute('for', 'checkbox' + i);
                    selectable.appendChild(inputCheckBox);
                    selectable.appendChild(label);
                    sno.appendChild(selectable);
                  }
                  var id = document.createElement('strong');
                  id.innerHTML = (i+1);
                  sno.appendChild(id);
                  return sno;
                }

                function createTDElement(column, row) {
                  var newColumn = document.createElement('td');
                  newColumn.className = column.className;
                  if(column.onclick) {
                    newColumn.className += ' columnPointer';
                  }
                  newColumn.addEventListener('mouseover', function(e) {
                    $scope.showTooltip(e, column, row);
                    $scope.$apply();
                  });
                  newColumn.addEventListener('mouseout', function(e) {
                    $scope.hideTooltip(e, column, row);
                    $scope.$apply();
                  });
                  var columnText = document.createElement('div');
                  if(!$scope.isEditable(column, row)) {
                    var text = $scope.showColumnValue(column, row);
                    if(text !== null) {
                      if(typeof text !== 'object') {
                        columnText.innerHTML = hasValue(text) ? text : "";
                      } else {
                        columnText.appendChild(text);
                      }
                    }
                  } else {
                    columnText.className = 'editable';
                    var inputEl = document.createElement('input');
                    if(column.editArgs.required) {
                      inputEl.setAttribute('required', true);
                    }
                    inputEl.setAttribute('value', hasValue(row[column.editArgs.ngModel]) ? row[column.editArgs.ngModel] : "");
                    inputEl.addEventListener('blur', function(ev) {
                      $scope.inputChanged(ev, column.editArgs.onChange);
                      $scope.$apply();
                    });
                    inputEl.addEventListener('change', function(ev) {
                      row[column.editArgs.ngModel] = ev.target.value;
                    });
                    switch(column.editArgs.editType) {
                      case 'number': inputEl.setAttribute('type', 'text');
                                    inputEl.addEventListener('keypress', function(ev) {
                                      return ((ev.charCode >= 48 && ev.charCode <= 57) || ev.charCode === 46);
                                    });
                                    break;
                      case 'text': inputEl.setAttribute('type', 'text');
                                    break;
                      case 'checkbox': inputEl.setAttribute('type', 'checkbox');
                    }
                    columnText.appendChild(inputEl);
                  }
                  newColumn.appendChild(columnText);
                  return newColumn;
                }

                function createTableHeader(pageData) {
                  var tableHeader = document.createElement('div');
                  tableHeader.className = "tableHeader";
                  var table = document.createElement('table');
                  var thead = document.createElement('thead');
                  var labelsHead = document.createElement('tr');
                  var arrowHead = document.createElement('tr');
                  arrowHead.className = "arrows";
                  if(!pageData.hideSerialNo) {
                    var snoHead = document.createElement('th');
                    var snoArrow = document.createElement('th');
                    snoHead.className = "sno";
                    snoArrow.className = "sno";
                    arrowHead.appendChild(snoArrow);
                    if(pageData.selectable) {
                      var selectable = document.createElement('span');
                      var inputCheckBox = document.createElement('input');
                      inputCheckBox.className = 'checkbox';
                      inputCheckBox.setAttribute('type', 'checkbox');
                      inputCheckBox.setAttribute('id', 'checkbox');
                      if($scope.selectAll) {
                        inputCheckBox.value = true;
                        inputCheckBox.checked = true;
                      }
                      inputCheckBox.addEventListener('change', function(ev) {
                        $scope.addAllSelected();
                        $scope.$apply();
                      });
                      var label = document.createElement('label');
                      label.className = 'index';
                      label.setAttribute('for', 'checkbox');
                      selectable.appendChild(inputCheckBox);
                      selectable.appendChild(label);
                      snoHead.appendChild(selectable);
                    }
                    var id = document.createElement('strong');
                    id.innerHTML = "#";
                    snoHead.appendChild(id);
                    labelsHead.appendChild(snoHead);
                  }
                  pageData.columns.forEach(function(column) {
                    if($scope.showColumn(column)) {
                      var columnTh = document.createElement('th');
                      columnTh.className = column.className;
                      columnTh.innerHTML = column.label;
                      labelsHead.appendChild(columnTh);

                      var columnArrowTh = document.createElement('th');
                      columnArrowTh.className = column.className;
                      if(column.showDownArrow) {
                        var arrowDiv = document.createElement('div');
                        arrowDiv.className = "down-arrow";
                        columnArrowTh.appendChild(arrowDiv);
                      }
                      arrowHead.appendChild(columnArrowTh);
                    }
                  });
                  if(!pageData.hideActions) {
                    var actionsHead = document.createElement('th');
                    actionsHead.className = "actions";
                    actionsHead.innerHTML = "Actions";
                    labelsHead.appendChild(actionsHead);
                    var actionsArrow = document.createElement('th');
                    actionsArrow.className = "actions";
                    arrowHead.appendChild(actionsArrow);
                  }
                  thead.appendChild(labelsHead);
                  thead.appendChild(arrowHead);
                  table.appendChild(thead);
                  tableHeader.appendChild(table);
                  return tableHeader;
                }

                function createTableBody(pageData, filteredList) {
                  var tableBody = document.createElement('div');
                  tableBody.className = "tableBody";
                  var table = document.createElement('table');
                  var tbody = document.createElement('tbody');
                  filteredList.forEach(function(row, i) {
                    var tr = document.createElement('tr');
                    if(!pageData.hideSerialNo) {
                      tr.appendChild(createSerialNoColumn(row, i, pageData));
                    }
                    tr.addEventListener('mouseover', function(e) {
                      $scope.showTooltip(e, pageData, row);
                      $scope.$apply();
                    });
                    tr.addEventListener('mouseout', function(e) {
                      $scope.hideTooltip(e, pageData, row);
                      $scope.$apply();
                    });
                    pageData.columns.forEach(function(column) {
                      if($scope.showColumn(column)) {
                        tr.appendChild(createTDElement(column, row));
                      }
                    });
                    if(!pageData.hideActions) {
                      var td = document.createElement('td');
                      td.className = 'rightAligned actions';
                      var buttonGroup = document.createElement('button-group');
                      buttonGroup.setAttribute('idLabel', 'buttonGroup' + i);
                      // buttonGroup.setAttribute('extra-args', row);
                      td.appendChild(buttonGroup);
                      var buttonScope = $scope.$new();
                      buttonScope.buttons = pageData.actions;
                      buttonScope.extraArgs = row;
                      $compile(buttonGroup)(buttonScope);
                      tr.appendChild(td);
                    }
                    tbody.appendChild(tr);
                  });
                  table.appendChild(tbody);
                  tableBody.appendChild(table);
                  return tableBody;
                }

                function createTable() {
                  while(tableDiv.firstChild) {
                    tableDiv.removeChild(tableDiv.firstChild);
                  }
                  var pageData = $scope.pageData;
                  var filteredList = $filter('filter')($scope.data, $scope.filterBy);
                  tableDiv.appendChild(createTableHeader(pageData));
                  if(filteredList && filteredList.length > 0) {
                    tableDiv.appendChild(createTableBody(pageData, filteredList));
                  }
                }
                $scope.$watch('filterBy', createTable);
                $scope.$watch('data', createTable, true);
                $rootScope.$on('render-table', createTable);
            }
        };
}]);
