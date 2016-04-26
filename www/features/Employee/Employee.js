angular
.module('employee', ['booker.service.book'])
.controller('employeeController', ['$scope', '$location', '$routeParams', '$filter', 'booker.service.book.BookerService',  function($scope, $location, $routeParams, $filter, BookerService){

  var LocationID = JSON.parse(sessionStorage.serviceLocationID );

  var services = JSON.parse(sessionStorage.selectedServices);
  var serviceIds = null;
  if(services.length > 0)
  {
    serviceIds = services[0].ID;
  }
  $scope.$emit('wait:start');
  BookerService
  .getAccessTokenFromSS()
  .then(function(access_token){

    access = access_token;

    var input = {
      LocationID: LocationID,
      access_token: access_token,
      TreatmentID: serviceIds
    };
    BookerService
    .findEmployees(input)
    .then(function(data){
      $scope.$emit('wait:stop');
        $scope.employees = data;
    })
    .catch(function(err){
      $scope.$emit("notification", {
        type: 'danger',
        message: "Server error"
      });
    });

  });
  $scope.CheckAvailability = function(id){
      sessionStorage.serviceEmployeeID = id;
      $location.path('/availability');
  }
}]);
