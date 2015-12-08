angular.module('Blog')
    .filter('toHtml', ['$sce', function($sce) {
        return function(text) {
            return $sce.trustAsHtml(text);
        }
    }]);
