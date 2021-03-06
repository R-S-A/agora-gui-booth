/**
 * This file is part of agora-gui-booth.
 * Copyright (C) 2015-2016  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-booth is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-booth  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-booth.  If not, see <http://www.gnu.org/licenses/>.
**/

/*
 * Selected Options directive.
 *
 * Lists the selected options for a question, allowing to change selection.
 */
angular.module('avBooth')
  .directive('avbSelectedOptions', function() {

    var link = function(scope, element, attrs) {

        if (!angular.isDefined(scope.presetSelectedSize)) {
          scope.presetSelectedSize = 0;
        }

        if (!angular.isDefined(scope.question)) {
          scope.question = {
            tally_type: scope.tallyType,
            max: scope.max
          };
        }
        /*
         * Toggles selection, if possible.
         */
        scope.toggleSelectItem = function(option) {
          if (option.selected > -1) {
            _.each(scope.options, function (element) {
              if (element.selected > option.selected) {
                element.selected -= 1;
              }
            });
            option.selected = -1;
          } else {
            var numSelected = _.filter(scope.options, function (element) {
              return element.selected > -1;
            }).length;

            // can't select more
            if (numSelected === scope.max) {
              return;
            }

            option.selected = numSelected;
          }
        };

      scope.numSelectedOptions = function () {
        return _.filter(
          scope.options,
          function (element) {
            return element.selected > -1 || element.isSelected === true;
          }).length;
      };

      scope.moveOption = function (moved, newPos) {
        var oldPos = moved.selected;
        newPos -= 1;
        if (oldPos === newPos || scope.presetSelectedSize > 0 && newPos < scope.presetSelectedSize) {
          return false;
        }

        if (newPos > oldPos) {
          _.each(scope.options, function (el) {
            if (el.selected === -1) {
              return;
            }

            if (el.id === moved.id) {
              el.selected = moved.selected = newPos;
            } else if (el.selected > oldPos && el.selected <= newPos) {
              el.selected -= 1;
              console.log("-- el.selected " + el.selected + ", el.text " + el.text);
            }
          });
        } else if (newPos < oldPos) {
          newPos += 1;
          _.each(scope.options, function (el) {
            if (el.selected === -1) {
              return;
            }

            if (el.id === moved.id) {
              el.selected = moved.selected = newPos;
            } else  if (el.selected >= newPos && el.selected < oldPos) {
              el.selected += 1;
              console.log("++ el.selected " + el.selected + ", el.text " + el.text);
            }
          });
        }
        return false;
      };


      scope.moveOption2 = function (moved, newPos) {
        var oldPos = moved.selected;
        var movedAlcaldable = (moved.category !== moved.categoryUnified);
        if (oldPos === newPos || (newPos === 0 && !movedAlcaldable)) {
          return false;
        }

        if (newPos > oldPos) {
          newPos -= 1;
          _.each(scope.options, function (el) {
            if (el.selected === -1) {
              return;
            }

            if (el.id === moved.id) {
              if (oldPos === 0) {
                el.selected = moved.selected = newPos + 1;
              } else {
                el.selected = moved.selected = newPos;
              }
            } else if (oldPos > 0 && el.selected > oldPos && el.selected <= newPos) {
              el.selected -= 1;
            } else if (oldPos === 0 && el.selected > newPos) {
              if (el.selected + 1 === scope.max) {
                el.selected = -1;
              } else {
                el.selected += 1;
              }
              console.log("-- el.selected " + el.selected + ", el.text " + el.text);
            }

            if (movedAlcaldable) {
              scope.blankVote.selected = 0;
            }
          });
        } else if (newPos < oldPos) {
          _.each(scope.options, function (el) {
            if (el.selected === -1) {
              return;
            }

            if (el.id === moved.id) {
              el.selected = moved.selected = newPos;
            } else  if (scope.blankVote.selected === 0 && newPos === 0) {
              if (el.selected > oldPos) {
                el.selected -= 1;
              }
            } else if (el.selected >= newPos && el.selected <= oldPos &&
              el.id !== scope.blankVote.id)
            {
              el.selected += 1;
              console.log("++ el.selected " + el.selected + ", el.text " + el.text);
            }
          });

          if (scope.blankVote.selected === 0 && newPos === 0) {
            scope.blankVote.selected = -1;
          }
        }
        return false;
      };

      scope.blankVote = _.filter(
        scope.options,
        function (el) {
          return (el.category === "Voto en blanco a la alcaldía");
        })[0];

      // doesn't count the first option which implies a blank vote in the first "round/question"
      scope.numSelectedOptions2 = function () {
        return _.filter(
          scope.options,
          function (element) {
            return (element.selected > -1 || element.isSelected === true) && element.id !== 0;
          }).length;
      };

      scope.toggleSelectItem2 = function(option) {
        if (option.id === 0) {
          return;
        }
        var elIsAlcaldable;

        if (option.selected > -1) {
          elIsAlcaldable = (option.category !== option.categoryUnified && option.selected === 0);
          if (elIsAlcaldable) {
            scope.blankVote.selected = 0;
          } else {
            _.each(scope.options, function (element) {
              if (element.selected > option.selected) {
                element.selected -= 1;
              }
            });
          }

          option.selected = -1;
        } else {
          var numSelected = scope.numSelectedOptions();
          var numSelected2 = scope.numSelectedOptions2();
          var alcaldableSelected = (numSelected === numSelected2);
          elIsAlcaldable = (option.category !== option.categoryUnified);
          var max = parseInt(scope.max,10);

          if (elIsAlcaldable) {
            if (!alcaldableSelected) {
              option.selected = 0;
              scope.blankVote.selected = -1;
            } else {

              // can't select more, flash info
              if (numSelected === parseInt(scope.max,10)) {
                $("#maxSelectedLimitReached").flash();
                return;
              }

              // put first in the list of concejalias as requested by client
              _.each(scope.options, function(el) {
                if (el.selected > 0) {
                  el.selected += 1;
                }
              });
              option.selected = 1;
            }
          } else {
            // can't select more, flash info
            if (numSelected === parseInt(scope.max,10)) {
              $("#maxSelectedLimitReached").flash();
              return;
            }

            option.selected = numSelected;
          }
        }
      };
    };

    return {
      restrict: 'AE',
      scope: {
        max: '=',
        min: '=',
        options: '=',
        tallyType: '=',
        presetSelectedSize: '=',
        layout: '=',
        sorted: "=",
        ordered: "="
      },
      link: link,
      templateUrl: 'avBooth/selected-options-directive/selected-options-directive.html'
    };
  });