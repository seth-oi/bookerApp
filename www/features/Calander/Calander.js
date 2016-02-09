angular
.module('calander', ['booker.service.book'])
.controller('calanderController', ['$scope', '$location', '$routeParams', 'booker.service.book.BookerService',  function($scope, $location, $routeParams, BookerService){
    $scope.minDate = new Date();
    $scope.date = new Date();
    $scope.$emit('wait:start');
    BookerService
        .getAccessTokenFromSS()
        .then(function(access_token){
            $scope.locationID = $routeParams.locationID;
            $scope.treatmentID = $routeParams.serviceID;
            var input = {
              LocationID: $routeParams.locationID,
              access_token: access_token,
              TreatmentID: $routeParams.serviceID
            };
            
            BookerService
            .findEmployees(input)
            .then(function(data){
                $scope.$emit('wait:stop');
                $scope.employees = data;
            })
            .catch(function(err){
                console.log(err);
                $scope.$emit("notification", {
                    type: 'danger',
                    message: err.data || "Server error"
                });
            });
        })
        .catch(function(err){
            $scope.$emit("notification", {
                type: 'danger',
                message: err.data || "Server error"
        });
    });
    $scope.addBooking = function(){
    };
}]);
