angular.module('Blog')
    .directive('fileModel', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs, ngModel) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                element.bind('change', function(event) {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                    });
                    //附件预览
                    scope.file = (event.srcElement || event.target).files[0];
                    scope.getFile();
                });
            }
        };
    }])
    .directive('ngFileSelect', function () {
        return {
            restrict: 'A',
            link: function ($scope, el) {
                el.bind('change',function(e){
                    $scope.file=(e.srcElement||e.target).files[0];
                    $scope.getFile();
                });
            }
        };
    });
