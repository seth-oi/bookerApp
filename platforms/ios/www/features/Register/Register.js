angular
.module('register', ['booker.service.book'])
.controller('registerController', ['$scope', '$location','booker.service.book.BookerService',  function($scope, $location, BookerService){
    if(sessionStorage.User != undefined)
    {
        $location.path('/booking');
    }
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
    })
    .catch(function(err){
        console.log(err);
        $scope.$emit("notification", {
                type: 'danger',
                message: err.data || "Server error"
        });
    });
    $scope.register = function(){
    	 	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	 	var email = re.test($scope.email);
    	 	var passwordReg = /^(?=.*\d)(?=.*[a-z])\w{8,25}$/
    	 	var password = passwordReg.test($scope.password);

    		if(!$scope.fname)
    		{
                $scope.$emit("notification", {
                    type: 'info',
                    message: 'Please Enter a Valid First Name'
                });
    			return;
    		}
    		if(!$scope.lname)
    		{
                $scope.$emit("notification", {
                    type: 'info',
                    message: 'Please Enter a Valid Last Name'
                });
    			return;
    		}
    		if(!$scope.email || !re.test($scope.email))
    		{
    			$scope.$emit("notification", {
                    type: 'info',
                    message: 'Please Enter a Valid Email Address'
                });	
    			return;
    		}
    		if(!$scope.password || $scope.password == '' || !passwordReg.test($scope.password))
    		{
                $scope.$emit("notification", {
                    type: 'info',
                    message: 'Please Enter a Valid Password. Password must be at least 8 characters, no more than 25 characters, and must include at least one numeric digit and no alpha numeric characters.'
                });
    			return;
    		}
    		if($scope.phone.length != 10)
    		{
    			$scope.$emit("notification", {
                    type: 'info',
                    message: 'Please Enter a Valid Phone Number'
                }); 
    			return;
    		}
    		var input = {
                "Password": $scope.password,
                "Email": $scope.email,
                "FirstName": $scope.fname,
                "HomePhone": $scope.phone,
                "LastName": $scope.lname,
                "LocationID": $scope.locationID,
                "access_token": $scope.access_token
    		};
            $scope.$emit('wait:start');
    		BookerService
    		.createCustomerAndUserAccount(input)
    		.then(function(data){

                $scope.$emit('wait:stop');
                if(data.data.IsSuccess)
                {
                    $scope.$emit("notification", {
                        type: 'success',
                        message: 'Account Create Successful'
                    });
                    $location.path('/login');
                }
                else
                {
                    $scope.$emit("notification", {
                        type: 'danger',
                        message: 'Server Error'
                    });
                }
    		})
    		.catch(function(err){
                $scope.$emit('wait:stop');
                $scope.$emit("notification", {
                    type: 'danger',
                    message: err.data || "Server error"
                });
    		});
    };
}]);
