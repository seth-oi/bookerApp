angular
.module('gifts', ['booker.service.book'])
.controller('giftCertificateController', ['$scope', '$location', '$interval', 'booker.service.book.BookerService', function($scope, $location, $interval, BookerService){

  if(sessionStorage.User == "null" || !sessionStorage.User)
  {
    $location.path('/login');
  }
  $scope.templateID = null;
  var access = {
      access_token: null,
      locationID: 21171
  };
  $scope.getGiftCertificates = function(){
    access.access_token = $scope.accessToken;
    access.locationID = $scope.locationID;
    $scope.$emit('wait:start');
    console.log(access);
    BookerService
      .getGiftTemplates(access)
      .then(function(data){
        console.log(data);
        $scope.$emit('wait:stop');
         $scope.gifts = data.GiftCertificateTemplates;
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
  $scope.$emit('wait:start');
   BookerService
   .getAccessTokenFromSS()
   .then(function(data){
     $scope.$emit('wait:stop');

        var input = {
      		access_token: data
      	};
        $scope.accessToken = data;
        access.access_token = data;
        $scope.$emit('wait:start');
        //$scope.locations = locations;
        access.locationID = 21171;
        $scope.locationID = 21171;
        $scope.getGiftCertificates();
        // BookerService
    		// .getLocations(input)
    		// .then(function(locations){
        //   console.log(locations);
        //   $scope.$emit('wait:stop');
    		//
    		// })
    		// .catch(function(err){
    		// 	$scope.$emit('wait:stop');
    		// 	$scope.$emit("notification", {
    		//         type: 'danger',
    		//         message: err.data || "Server error"
    		//     });
    		// 	console.log(err);
    		// });

   })
   .catch(function(err){
      $scope.$emit("notification", {
            type: 'danger',
            message: err.data || "Server error"
      });
   });
   $scope.$watch('locationID', function(newVal, oldVal){
     if(newVal != oldVal)
     {
       $scope.getGiftCertificates();
     }
   });
   $scope.proceed = function(template){
    console.log(template);
    if(template)
    {
     sessionStorage.template =  JSON.stringify(template);
     $location.path('/giftDetails');
    }
   }
}]);
