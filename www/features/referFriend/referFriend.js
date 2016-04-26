angular
.module('referFriend', ['booker.service.book', "ngCordova"])
.controller('referFriendController', ['$scope', '$location', 'booker.service.book.BookerService', '$cordovaOauth', '$http', function($scope, $location, BookerService, $cordovaOauth, $http){
    $scope.sms = function(){
        $location.path('/referDetails/false');
    }
    $scope.email = function(){
        $location.path('/referDetails/true');
    }
}])
.controller('referDetailsController', ['$scope', '$location', 'booker.service.book.BookerService',  '$routeParams', function($scope, $location, BookerService, $routeParams){
    $scope.ContactEmail = null;
    $scope.e = {
      to: "",
      from: "",
      message: ""
    }
   if($routeParams.email == 'false')
    {
        $scope.email = false;
    }
    else
    {
        $scope.email = true;
    }
    $scope.sent = function(){
      $scope.$emit('notification', {
          type:'success',
          "message": "Referral Message Sent"
      });
    }
    $scope.pickContact = function(){
        navigator.contacts.pickContact(function(contact){
          if($routeParams.email == 'false')
           {
             $scope.phoneNumber = contact.phoneNumbers[0].value;
             $scope.contactName = contact.name.formatted;
           }
           else
           {
             console.log(JSON.stringify(contact.emails[0].value));
             $scope.ContactEmail = contact.emails[0].value;
             $scope.contactName = contact.name.formatted;
           }
            //$scope.phoneNumber = contact.phoneNumbers[0].value;
            //$scope.contactName = contact.name.formatted;
        },function(error){
          // $scope.$emit('notification', {
          //     type:'danger',
          //     "message": "Please try again later."
          // });
        });
    }
    $scope.cancel = function(){
        $location.path('/booking');
    }
    $scope.sendMessage = function(){
      $scope.$emit('wait:start');
      BookerService
      .sendReferralSMS(input)
      .then(function(data){
          $scope.$emit('wait:stop');
          if(data){
              $scope.$emit('notification', {
                  type:'success',
                  "message": "Referral Email Sent"
              });
          }
          else{
            $scope.$emit('notification', {
                type:'danger',
                "message": "Referral Email Send Failed"
            });
          }
      })
      .catch(function(err){
        $scope.$emit('wait:stop');
          $scope.$emit('notification', {
              type:'danger',
              "message": "Unable to send Referral Email"
          })
      });
    }
    $scope.sendEmail = function(){
      if($scope.ContactEmail)
      {
        $scope.e.to = $scope.ContactEmail;
      }
      if($scope.e.to == null || $scope.e.from == null)
      {
        $scope.$emit('notification', {
            type:'success',
            "message": "Enter a Valid Emails"
        });
      }
      var x = $scope.e.to;
      var atpos = x.indexOf("@");
      var dotpos = x.lastIndexOf(".");
      if (atpos<1 || dotpos<atpos+2 || dotpos+2>=x.length) {
        $scope.$emit('notification', {
            type:'success',
            "message": "Enter a Valid Receiver Email"
        });
        return false;
      }
      var y = $scope.e.from;
      var atposy = y.indexOf("@");
      var dotposy = y.lastIndexOf(".");
      if (atposy<1 || dotposy<atposy+2 || dotposy+2>=y.length) {
        $scope.$emit('notification', {
            type:'success',
            "message": "Enter a Valid Sender Email"
        });
          return false;
      }

        var input = {
            'to': $scope.e.to,
            'from': $scope.e.from,
            'message': $scope.e.message
        };
        $scope.$emit('wait:start');
        BookerService
        .sendReferralMail(input)
        .then(function(data){
            $scope.$emit('wait:stop');
            if(data){
                $scope.$emit('notification', {
                    type:'success',
                    "message": "Referral Email Sent"
                });
            }
            else{
              $scope.$emit('notification', {
                  type:'danger',
                  "message": "Referral Email Send Failed"
              });
            }
        })
        .catch(function(err){
          $scope.$emit('wait:stop');
            $scope.$emit('notification', {
                type:'danger',
                "message": "Unable to send Referral Email"
            })
        });
    }
}]);
