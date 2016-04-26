angular.module('services', ['booker.service.book'])
.controller('serviceController', ['$scope', '$rootScope', '$location', '$routeParams', 'booker.service.book.BookerService', function($scope, $rootScope, $location, $routeParams, BookerService){
    $scope.locationID = $routeParams.locationId;
    $rootScope.showProceed = true;
    $scope.$emit('wait:start');
    $scope.categories = [];
    $scope.filterSelected = [];
    $scope.changed = function(service){
        if(service.selected)
        {
            service.selected = false;
        }
        else{
            service.selected = true;
        }
    };
    $scope.$on('showServices', function(){
        $scope.showServices();
    });
    $scope.showServices = function(){
        if($scope.filterSelected.length > 0){
            sessionStorage.selectedServices = JSON.stringify($scope.filterSelected);
            sessionStorage.serviceLocationID = JSON.stringify($scope.locationID);
            $location.path('/employee');
        }
        else
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please select a service to continue"
            });
        }
    };
    $scope.$watch('services', function(newVal, oldVal){
        if(newVal != oldVal){
            $scope.filterSelected = _.filter($scope.services, {"selected": true});
            $rootScope.filterSelected = $scope.filterSelected;
        }
    }, true);

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

                $scope.$emit('wait:stop');
                data.forEach(function(val){
                    $scope.categories.push(val.Category.Name);
                });
                $scope.categories = _.uniq($scope.categories);
                $scope.selectedCategory = $scope.categories[0];
                $scope.services = data;
                $scope.$emit('wait:start');
                BookerService
                .locationPayment(input)
                .then(function(data){
                    $scope.$emit('wait:stop');
                    if(data && data.OnlineBookingSettings)
                    {
                      sessionStorage.locationPayment = data.OnlineBookingSettings.RequirePaymentInformation;
                    }
                })
                .catch(function(err){
                  console.log(err);
                });
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
