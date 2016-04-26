angular.module('forgotPassword', ['booker.service.book'])
.controller('forgotPasswordController', ['$scope', 'booker.service.book.BookerService', function($scope, BookerService){
    $scope.$emit('wait:start');
    var accessToken;
    BookerService
    .getAccessTokenFromSS()
    .then(function(access_token){
      $scope.$emit('wait:stop');
      accessToken = access_token;
    })
    .catch(function(err){
        $scope.$emit("notification", {
            type: 'danger',
            message: err.data || "Server error"
        });
    });

    $scope.sendResetLink = function(){
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      var email = re.test($scope.email);

      if(!email)
      {
        $scope.$emit("notification", {
            type: 'danger',
            message: "Please Enter a Valid Email."
        });
        return false;
      }
      if(!$scope.firstName)
      {
        $scope.$emit("notification", {
            type: 'danger',
            message: "Please Enter a First Name."
        });
        return false;
      }
      $scope.$emit('wait:start');
      var input = {
        "Email": $scope.email || 'sethshines@gmail.com',
        "Firstname": $scope.Firstname || 'Rahul',
        "LocationID": 28065,
        "BrandID": null,
        "access_token": accessToken,
      }
      BookerService
      .forgotPassword(input)
      .then(function(data){
          $scope.$emit('wait:stop');
          console.log('NOW PRINTING');
        console.log(data);
        if(data.IsSuccess)
        {
          $scope.$emit("notification", {
              type: 'success',
              message: "Reset Link Sent to your Email."
          });
        }
      })
      .catch(function(err){
        $scope.$emit('wait:stop');
          console.log(err);
      });
    }
}]);
