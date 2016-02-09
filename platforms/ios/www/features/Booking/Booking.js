angular
.module('booking', ['booker.service.book'])
.controller('bookingController', ['$scope', '$location', '$interval', 'booker.service.book.BookerService', function($scope, $location, $interval, BookerService){
  $scope.$emit('wait:start');
  if(sessionStorage.User != "null")
  {
    $location.path('/booking');
  }
   BookerService
   .getAccessTokenFromSS()
   .then(function(data){
        var access = {
            access_token: data
        };
        BookerService
        .findLocations(access)
        .then(function(data){
          console.log(data);
          $scope.$emit('wait:stop');
           $scope.locations = data;
        })
        .catch(function(err){
          $scope.$emit('wait:stop');
          $scope.$emit("notification", {
            type: 'danger',
            message: err.data || "Server error"
          });
          console.log(err);
      });
   })
   .catch(function(err){
      $scope.$emit("notification", {
            type: 'danger',
            message: err.data || "Server error"
      });
   });
}]);
