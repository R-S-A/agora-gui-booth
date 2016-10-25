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
 * Accordion Options directive.
 *
 * Lists the available options for a question, grouping options via their
 * category. Used by avbAvailableOptions directive.
 */
angular.module('avBooth')
  .directive('avbAccordionOptions', function() {

    var link = function(scope, element, attrs) {
      // group by category
      var categories = _.groupBy(scope.options, "category");
      scope.folding_policy = undefined;
      if (angular.isDefined(scope.question.extra_options))
      {
        scope.folding_policy = scope.question.extra_options.accordion_folding_policy;
      }

      // convert this associative array to a list of objects with title and
      // options attributes
      scope.categories = _.map(_.pairs(categories), function(pair) {
        var i = -1;
        var title = pair[0];
        var answers = pair[1];

        return {
          title: title,
          options: answers,
          isOpen: (scope.folding_policy === "unfold-all")
        };
      });

      // apply shuffling policy
      if (angular.isDefined(scope.question.extra_options) &&
        angular.isDefined(scope.question.extra_options.shuffling_policy))
      {
        if("shuffle-categories-only" === scope.question.extra_options.shuffling_policy)
        {
          scope.categories = _.shuffle(scope.categories);
        }
        else if ("shuffle-all-options" === scope.question.extra_options.shuffling_policy)
        {
          scope.categories = _.each( scope.categories, function(category) {
            category.options = _.shuffle(category.options)
          });
        }
        else if ("shuffle-options-on-some-categories" === scope.question.extra_options.shuffling_policy &&
                 angular.isArray(scope.question.extra_options.shuffle_category_list)
        )
        {
          scope.categories = _.each( scope.categories, function(category) {
            if (-1 != scope.question.extra_options.shuffle_category_list.indexOf(category.title))
            {
              category.options = _.shuffle(category.options)
            }
          });
        }
      }

      scope.nonEmptyCategories = _.filter(scope.categories, function (cat) {
        return !!cat.title && cat.title.length > 0;
      });

      scope.emptyCategory = _.find(scope.categories, function (cat) {
        return !(!!cat.title && cat.title.length > 0);
      });

      if (!scope.emptyCategory) {
        scope.emptyCategory = {title: "", options: [], isOpen: true};
      }

      scope.categoryIsSelected = function(category) {
        return _.filter(category.options, function (el) {
          return el.selected > -1;
        }).length === category.options.length;
      };

      scope.deselectAll = function(category) {
        _.each(category.options, function(el) {
          if (el.selected > -1) {
            scope.toggleSelectItem2(el);
          }
        });
      };

      scope.numSelectedOptions = function () {
        return _.filter(
          scope.options,
          function (element) {
            return element.selected > -1 || element.isSelected === true;
          }).length;
      };
    };

    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avBooth/accordion-options-directive/accordion-options-directive.html'
    };
  });