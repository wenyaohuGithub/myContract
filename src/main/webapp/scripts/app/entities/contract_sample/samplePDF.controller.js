'use strict';

angular.module('mycontractApp').controller('SamplePDFController',
    ['$scope', '$stateParams', '$modalInstance', '$sce', 'content', 'Contract_sample', 'FileUpload',
        function($scope, $stateParams, $modalInstance, $sce, content, Contract_sample, FileUpload) {

    $scope.pdfContent = $sce.trustAsResourceUrl(content);
    $scope.clear = function() {
        console.log($scope.pdfContent);
        $modalInstance.dismiss('cancel');
    };

}]);
