angular.module('manageAppointments', ['booker.service.book'])
.controller('manageAppointmentController', ['$scope', '$location', '$routeParams', '$uibModal', 'booker.service.book.BookerService', function($scope, $location, $routeParams, $modal, BookerService){
    if(!sessionStorage.User)
    {
        $location.path('/login');
    }
    $scope.fetchAppointments = function()
        {
            $scope.$emit('wait:start');
            BookerService
            .getAccessTokenFromSS()
            .then(function(access_token){
                    var input = {
                        CustomerID: User.CustomerID,
                        access_token: User.access_token
                    };
                    BookerService
                    .getCustomerAppointments(input)
                    .then(function(data){
                        console.log(data);
                        $scope.$emit('wait:stop');
                        $scope.appointments = data;
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
        };
    if(sessionStorage.User != "null")
    {
        var User = JSON.parse(sessionStorage.User);
        if(!User)
        {
            $location.path('/login');
        }
        $scope.fetchAppointments();
    }

    $scope.openModal = function(appointment){
        var modalInstance = $modal.open({
            templateUrl: 'features/ManageAppointments/appointmentDetails.html',
              controller: 'ModalInstanceCtrl',
              size: 'sm',
              windowClass: 'center-modal',
              resolve: {
                appointment: function () {
                  return appointment;
                }
              }
        });

        modalInstance.result.then(function (reload) {
              if(reload)
              {
                $scope.$emit("notification", {
                    type: 'success',
                    message: "Appointment Cancellation successful."
                });
                $scope.fetchAppointments();
              }
              else{
                $scope.$emit("notification", {
                    type: 'danger',
                    message: "Appointment Cancellation unsuccessful. Couldn’t cancel appointment because of applicable cancellation policy. Please contact spa directly"
                });
              }
           }, function () {});
    };
}])
.controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', 'appointment', 'booker.service.book.BookerService', function($scope, $uibModalInstance, appointment, BookerService){
    $scope.appointment = appointment;
    var brac = $scope.appointment.StartDateTime.indexOf('(') + 1;
    var minus = $scope.appointment.StartDateTime.indexOf(')');
    var date = new Date(parseInt($scope.appointment.StartDateTime.slice(brac, minus)));
    $scope.appointmentStartTime = date;
    $scope.$emit('wait:start');
    BookerService
    .getAccessTokenFromSS()
    .then(function(access_token){
      $scope.$emit('wait:stop');
          var data = {
            access_token: access_token,
            id: appointment.ID
          }
          $scope.$emit('wait:start');
          BookerService
          .canCancelAppointment(data)
          .then(function(data){

            $scope.canCancelAppointment = data.IsCancellationPolicyApplicable;
            $scope.isAlreadyCancel = data.IsAlreadyCancelled;
            $scope.$emit('wait:stop');
          })
          .catch(function(err){
            $scope.$emit('wait:stop');
            console.log(err);
          })
    })
    .catch(function(err){
      console.log(err);
    });
    $scope.close = function(){
        $uibModalInstance.dismiss();
    }
    function onConfirm2(buttonIndex)
    {
      console.log('INSIDE CONFIRM @');
        if(buttonIndex == 2)
        {
          console.log('CANCELING NOW');
          var User = JSON.parse(sessionStorage.User);
            var input = {
                ID: appointment.ID,
                access_token: User.access_token
            };
            if($scope.canCancelAppointment == false)
            {
              $scope.$emit('wait:start');
              BookerService
              .cancelAppointment(input)
              .then(function(data){
                $scope.$emit('wait:stop');
                  if(data.IsSuccess){
                      $uibModalInstance.close(true);
                  }
                  else{
                      $uibModalInstance.close(false);
                  }
              })
              .catch(function(err){
                  $scope.$emit('wait:stop');
                  $uibModalInstance.close(true);
                  $scope.$emit("notification", {
                          type: 'danger',
                          message: "An Unexpected Error Occured"
                      });
                  console.log(JSON.stringify(err));
              });
            }
            else{
              $uibModalInstance.dismiss();
              $scope.$emit("notification", {
                      type: 'danger',
                      message: "This Appointment can't be cancelled now. Please Contact Salon admin for more details."
                  });
            }

        }
    }
    $scope.cancel = function(){
        if(!sessionStorage.User)
        {
            $location.path('/login');
            return;
        }
        if(sessionStorage.User != 'null')
        {
            navigator.notification.confirm('Are You Sure, You want to Cancel Booking ??', onConfirm2, 'Marilyn Monroe', ['Close','Confirm']);
        }
    }
}]);
