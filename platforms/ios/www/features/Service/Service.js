angular.module('services', ['booker.service.book'])
.controller('serviceController', ['$scope', '$location', '$routeParams', 'booker.service.book.BookerService', function($scope, $location, $routeParams, BookerService){
    $scope.locationID = $routeParams.locationId;
    console.log($scope.locationID);
    $scope.$emit('wait:start');
    BookerService
    .getAccessTokenFromSS()
    .then(function(access_token){
        if($routeParams.locationId)
        {
            var input = {
                LocationID: $routeParams.locationId,
                access_token: access_token
            };
    
            BookerService
            .findTreatments(input)
            .then(function(data){
                console.log(data);
                $scope.$emit('wait:stop');
                console.log('Found Some Data');
                $scope.services = data;
            })
            .catch(function(err){
                $scope.$emit('wait:stop');
                $scope.$emit("notification", {
                    type: 'danger',
                    message: err.data || "Server error"
                });
                console.log(err);
            });
        }
    })
    .catch(function(err){
        $scope.$emit("notification", {
            type: 'danger',
            message: err.data || "Server error"
        });
    });
}]);
