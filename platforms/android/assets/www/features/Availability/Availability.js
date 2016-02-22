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
            //var offset =  moment().format('ZZ');
            //var offsetHrs = parseInt(offset.slice(1, 3)) * 60 * 60 * 1000;
            //var offsetmin = parseInt(offset.slice(3, offset.length)) * 60 * 1000;
            var startTimeString = (new Date()).getTime();
            var future = (new Date()).getTime() + 7 * 24 * 60 * 59000;
            var input = {
              EndDateTime: "/Date(" + future + ")/",
              StartDateTime:"/Date(" + startTimeString + ")/",
              Itineraries: [
                {
                    "IsPackage": false,
                    "PackageID": null,
                    "Treatments": [
                        {
                            "Employee2ID": null,
                            "EmployeeGenderID": null,
                            "EmployeeID": null,
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
                $scope.$emit('wait:stop');
                $scope.availableTimeSlots = data.ItineraryTimeSlotsLists[0].ItineraryTimeSlots;
                sessionStorage.locationId = $routeParams.locationID;
                
                $scope.datesArr = [];
                $scope.timeArr = [];
                $scope.DateTimeArr = [];
                $scope.TimeArr = [];
                //console.log($scope.availableTimeSlots);
                $scope.availableTimeSlots.forEach(function(date, index){
                    $scope.DateTimeArr.push(moment(date.StartDateTime).format('D MMM YYYY'));
                    $scope.TimeArr.push(moment(date.StartDateTime).format('D MMM YYYY HH:mm A'));
                });
                var finalObjectArr = {};
                $scope.DateTimeArr = _.uniq($scope.DateTimeArr);
                $scope.DateTimeArr.forEach(function(date){
                    $scope.TimeArr.forEach(function(dateTime, index){
                        if(moment(moment(dateTime, 'D MMM YYYY HH:mm A').format('D MMM YYYY').toString()).isSame(date, 'day'))
                        {
                            if(finalObjectArr[date])
                            {
                                finalObjectArr[date].push({ time: moment(dateTime, 'D MMM YYYY HH:mm A').format('h:mm a'), "index": index });
                            }
                            else
                            {
                                finalObjectArr[date] = [];
                                finalObjectArr[date].push({ time: moment(dateTime, 'D MMM YYYY HH:mm A').format('h:mm a'), "index": index });
                            }
                        }    
                    })
                })
                $scope.dates =  Object.keys(finalObjectArr);
                $scope.selected.selectedDate = $scope.dates[0];
                $scope.$watch('selected.selectedDate', function(newVal, oldVal){
                    $scope.appTimes = finalObjectArr[$scope.selected.selectedDate];
                    console.log($scope.appTimes[0].index);
                    $scope.selected.selectedTime = $scope.appTimes[0].index;
                })
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
    $scope.cancel = function(){
        sessionStorage.removeItem("IncompleteAppointmentID");
        sessionStorage.removeItem("gift");
        sessionStorage.removeItem("giftAmount");
        $location.path('/Bookings');
    };
    $scope.addIncompleteBooking = function(){
        var SelectedTimeSlotAppointment = $scope.availableTimeSlots[$scope.selected.selectedTime];
        var brac = SelectedTimeSlotAppointment.StartDateTime.indexOf('(') + 1;
        var minus = SelectedTimeSlotAppointment.StartDateTime.indexOf(')');
        var selectedTimeStamp = parseInt(SelectedTimeSlotAppointment.StartDateTime.slice(brac, minus));
        appointmentMetaData.IsPackage = SelectedTimeSlotAppointment.IsPackage;
        appointmentMetaData.PackageID = SelectedTimeSlotAppointment.PackageID;
        appointmentMetaData.Amount = SelectedTimeSlotAppointment.TreatmentTimeSlots[0].CurrentPrice.Amount;
        appointmentMetaData.Duration = SelectedTimeSlotAppointment.TreatmentTimeSlots[0].Duration;
        appointmentMetaData.EmployeeID = SelectedTimeSlotAppointment.TreatmentTimeSlots[0].EmployeeID;
        appointmentMetaData.CurrencyCode = SelectedTimeSlotAppointment.TreatmentTimeSlots[0].CurrentPrice.CurrencyCode;
        appointmentMetaData.StartDateTime = selectedTimeStamp;
        sessionStorage.appointmentMetaData = JSON.stringify(appointmentMetaData);
        var data = {
            LocationID: $routeParams.locationID,
            access_token: access,
            TreatmentID: $routeParams.treatmentID, 
            StartDateTime: selectedTimeStamp
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
                        StartDateTime: selectedTimeStamp
                    });
                sessionStorage.IncompleteAppointmentID = data.IncompleteAppointmentID;
                
                if(!sessionStorage.User)
                {
                    $scope.$emit("notification", {
                        type: 'success',
                        message: "Please Login or Register To Complete Appointment."
                    });
                    $location.path('/login');
                }
                else if(sessionStorage.User != 'null' )
                {
                    $scope.$emit("notification", {
                        type: 'success',
                        message: "Please Enter Payment Details To Complete Appointment."
                    });
                    $location.path('/payment/false');
                }
                else{
                    $scope.$emit("notification", {
                        type: 'success',
                        message: "Please Login or Register To Complete Appointment.."
                    });
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
