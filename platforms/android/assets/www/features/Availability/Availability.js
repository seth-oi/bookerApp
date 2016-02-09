angular
.module('availability', ['booker.service.book'])
.controller('availabilityController', ['$scope', '$location', '$routeParams', 'booker.service.book.BookerService',  function($scope, $location, $routeParams, BookerService){
    $scope.minDate = new Date();
    $scope.date = new Date();
    $scope.$emit('wait:start');
    var appointmentMetaData = {
        IsPackage: null,
        PackageID: null,
        Amount: null,
        Duration: null,
        EmployeeID: null,
        CurrencyCode: null,
        StartDateTime: null
    };
    $scope.selected ={
        selectedTime:null,
        selectedDate:null
    }
    var access;
    BookerService
        .getAccessTokenFromSS()
        .then(function(access_token){
            access = access_token;
            var future = (new Date()).getTime() + 7 * 24 * 60 * 59000;
            var input = {
              EndDateTime: "/Date(" + future + "-0000 )/",
              StartDateTime:"/Date(" + (new Date()).getTime() + "-0000 )/",
              Itineraries: [
                {
                    "IsPackage": false,
                    "PackageID": null,
                    "Treatments": [
                        {
                            "Employee2ID": null,
                            "EmployeeGenderID": null,
                            "EmployeeID": $routeParams.employeeID,
                            "TreatmentID": $routeParams.treatmentID
                        }
                    ],
                    "IncludeCutOffTimes": true
                }
                ],
              LocationID: $routeParams.locationID,
              access_token: access_token
            };
            
            BookerService
            .runMultiServiceAvailability(input)
            .then(function(data){
                console.log(data);
                $scope.$emit('wait:stop');
                $scope.availableTimeSlots = data.ItineraryTimeSlotsLists[0].ItineraryTimeSlots;
                sessionStorage.locationId = $routeParams.locationID;
                
                appointmentMetaData.IsPackage = data.ItineraryTimeSlotsLists[0].ItineraryTimeSlots.IsPackage,
                appointmentMetaData.PackageID = data.ItineraryTimeSlotsLists[0].ItineraryTimeSlots.PackageID,
                appointmentMetaData.Amount = data.ItineraryTimeSlotsLists[0].ItineraryTimeSlots[0].TreatmentTimeSlots[0].CurrentPrice.Amount,
                appointmentMetaData.Duration = data.ItineraryTimeSlotsLists[0].ItineraryTimeSlots[0].TreatmentTimeSlots[0].Duration,
                appointmentMetaData.EmployeeID = data.ItineraryTimeSlotsLists[0].ItineraryTimeSlots[0].TreatmentTimeSlots[0].EmployeeID,
                appointmentMetaData.CurrencyCode = data.ItineraryTimeSlotsLists[0].ItineraryTimeSlots[0].TreatmentTimeSlots[0].CurrentPrice.CurrencyCode
                sessionStorage.appointmentMetaData = JSON.stringify(appointmentMetaData);
                $scope.datesArr = [];
                $scope.timeArr = [];
                $scope.availableTimeSlots.forEach(function(date){
                    var brac = date.StartDateTime.indexOf('(') + 1;
                    var minus = date.StartDateTime.indexOf(')');
                    var date = new Date(parseInt(date.StartDateTime.slice(brac, minus)));
                    $scope.datesArr.push(moment(date).format('LL'));
                    var hours = date.getHours();
                    // Minutes part from the timestamp
                    var minutes = "0" + date.getMinutes();
                    // Seconds part from the timestamp
                    var seconds = "0" + date.getSeconds();
                    // Will display time in 10:30:23 format
                    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                    $scope.timeArr.push(formattedTime);
                });
                $scope.datesArr = _.uniq($scope.datesArr);
                $scope.selected.selectedDate = $scope.datesArr[0];
                $scope.timeArr = _.uniq($scope.timeArr);
                $scope.selected.selectedTime = $scope.timeArr[0];
            })
            .catch(function(err){
                console.log(err);
                $scope.$emit("notification", {
                    type: 'danger',
                    message: err.data || "Server error"
                });
            });
        })
        .catch(function(err){
            $scope.$emit("notification", {
                type: 'danger',
                message: err.data || "Server error"
        });
    });
    
    $scope.addIncompleteBooking = function(){
        
        var dateUnix = parseInt(moment($scope.selected.selectedDate, 'LL').unix()) * 1000;
        var tempDate = moment($scope.selected.selectedTime, 'h:mm:ss').format('hh:mm');
        var colon = tempDate.indexOf(':');
        var hrs = tempDate.slice(0, colon);
        var min = tempDate.slice(colon + 1, $scope.selected.selectedTime.length);
        dateUnix = dateUnix + hrs * 60 * 60 * 1000 + min * 60 * 1000;
        var finaldateUnix = dateUnix.toString();
        appointmentMetaData.StartDateTime = finaldateUnix;
        console.log(appointmentMetaData.StartDateTime);
        sessionStorage.appointmentMetaData = JSON.stringify(appointmentMetaData);
        var data = {
            LocationID: $routeParams.locationID,
            access_token: access,
            TreatmentID: $routeParams.treatmentID, 
            StartDateTime: finaldateUnix
        };
        $scope.$emit('wait:start');
        BookerService
        .createIncompleteAppointment(data)
        .then(function(data){
            $scope.$emit('wait:stop');
            if(data.IncompleteAppointmentID && data.IsSuccess)
            {   
                sessionStorage.appointmentData = JSON.stringify(
                    {
                        LocationID: $routeParams.locationID,
                        access_token: access,
                        TreatmentID: $routeParams.treatmentID, 
                        StartDateTime: finaldateUnix
                    });
                sessionStorage.IncompleteAppointmentID = data.IncompleteAppointmentID;
                $scope.$emit("notification", {
                    type: 'success',
                    message: "Incomplete Appointment Booked"
                });
                if(!sessionStorage.User)
                {
                    $location.path('/login');
                }
                else if(sessionStorage.User != 'null' )
                {
                    $location.path('/payment/false');
                }
                else{
                    $location.path('/login');   
                }
            }
            else if(!data.IsSuccess && data.ErrorMessage)
            {
                $scope.$emit("notification", {
                    type: 'danger',
                    message: data.ErrorMessage
                });   
            }
            else
            {
                $scope.$emit("notification", {
                    type: 'success',
                    message: "Incomplete Appointment Booking Failed"
                });   
            }

        })
        .catch(function(err){
            console.log(err);
        })
    };
}]);
