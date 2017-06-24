'use strict';

angular.module('mycontractApp')
    .directive("markItUp", ["markitupSettings", function(markitupSettings) {
    return {
        restrict: "A",
        scope: {
            ngModel: "="
        },
        link: function(scope, element, attrs) {
            var settings;
            settings = markitupSettings.create(function(event) {
                scope.$apply(function() {
                    scope.ngModel = event.textarea.value;
                });
            });
            angular.element(element).markItUp(settings);
        }
    };
}
]);