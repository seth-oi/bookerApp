angular
.module('login', ['booker.service.book'])
.controller('loginController', ['$rootScope', '$scope', '$location', 'booker.service.book.BookerService', function($rootScope, $scope, $location, BookerService){
	if(sessionStorage.User != undefined)
	{
		$location.path('/booking');
	}
	$scope.username = null;
	$scope.password = null;
	$scope.$emit('wait:start');
	BookerService
    .getAccessTokenFromSS()
    .then(function(access_token){


    	$scope.access_token = access_token;
    	
    	var input = {
    		access_token: access_token
    	};
    	
    	BookerService
		.getLocations(input)
		.then(function(locations){
			console.log(locations);
			$scope.$emit('wait:stop');
			$scope.locationID = locations[0].ID;
			$scope.locations = locations;
		})
		.catch(function(err){
			$scope.$emit('wait:stop');
			$scope.$emit("notification", {
		        type: 'danger',
		        message: err.data || "Server error"
		    });
			console.log(err);
		});
    });
	$scope.login = function(){
		if($scope.username=='' || !$scope.username)
		{
			$scope.$emit("notification", {
                    type: 'info',
                    message: 'Enter a valid Username/E-mail'
                });
			return;
		}
		if($scope.password== '' || !$scope.password)
		{
			$scope.$emit("notification", {
                    type: 'info',
                    message: 'Enter a valid Password'
                });
			return;
		}

		var data = {
			"Email": $scope.username,
			"Password": $scope.password,
			"LocationID": $scope.locationID
		}
		$scope.$emit('wait:start');
		BookerService
		.login(data)
		.then(function(data){
			$scope.$emit('wait:stop');
			if(!data.data.error)
			{
				$scope.$emit('user:loggedIn');
				$rootScope.loggedIn = true;
				data.data.Customer.access_token = data.data.access_token;
				var customerData = data.data.Customer;
				sessionStorage.setItem('User', JSON.stringify(customerData));
				sessionStorage.setItem('locationID', 21324);
				if(sessionStorage.IncompleteAppointmentID)
    			{
    				$location.path('/payment/false');
    			}
    			else
    			{
    				$location.path('/booking');
    			}
			}
			else{
				$scope.$emit("notification", {
		            type: 'danger',
		            message: data.data.error || "Server error"
		        });
			}
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
}]);
