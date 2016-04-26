angular
.module('location', ['booker.service.book'])
.controller('locationController', ['$rootScope', '$scope', '$location', 'booker.service.book.BookerService', function($rootScope, $scope, $location,  BookerService){
	$scope.directions = false;
	$scope.click = function($event){
			sessionStorage.dest = $($event.currentTarget).siblings().text();
			sessionStorage.mode = $scope.travelMode;
			$scope.locationFinal = $($event.currentTarget).siblings().text();
			$scope.directions = true;
	};

     var currrentLocation = sessionStorage.location ? JSON.parse(sessionStorage.location) : {Latitude: 0, Longitude: 0};
		 $scope.currentLoc = '' + currrentLocation.Latitude + ', ' + currrentLocation.Longitude + '';
}])
.controller('locationDirectionController', ['$scope', function($scope){
		if(sessionStorage.dest)
		{
			$scope.dest = sessionStorage.dest;
			$scope.mdoe = sessionStorage.mode;
		}
}]);
