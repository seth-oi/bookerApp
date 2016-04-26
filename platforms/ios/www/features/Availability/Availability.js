angular
.module('availability', ['booker.service.book'])
.controller('availabilityController', ['$scope', '$location', '$routeParams', '$filter', 'booker.service.book.BookerService',  function($scope, $location, $routeParams, $filter, BookerService){
    $scope.minDate = new Date();
    $scope.date = new Date();
    // $scope.$emit('wait:start');
    // $scope.maxDate = null;
    // $scope.dateOptionsNew = {
    //     changeYear: false,
    //     changeMonth: true,
    //     dateFormat:'mm/dd/yy',
    //     minDate: 0,
    //     maxDate: $scope.maxDate
    // };
    var LocationID = JSON.parse(sessionStorage.serviceLocationID);
    var EmployeeID = JSON.parse(sessionStorage.serviceEmployeeID);
    console.log(EmployeeID);
    var appointmentMetaData = {
        IsPackage: null,
        PackageID: null,
        Amount: null,
        Duration: null,
        EmployeeID: EmployeeID ? EmployeeID : null,
        CurrencyCode: null,
        StartDateTime: null
    };
    $scope.selected ={
        selectedTime:null,
        selectedDate:null
    }
    console.log($scope.selected);
    var access;
    var Itineraries = [];
    var services = JSON.parse(sessionStorage.selectedServices);
    var treatmentids = [];
    if(services != null)
    {
        services.forEach(function(service){
            treatmentids.push(service.ID);
            Itineraries.push({
                "IsPackage": false,
                "PackageID": null,
                "Treatments": [{
                    "Employee2ID": null,
                    "EmployeeGenderID": null,
                    "EmployeeID": EmployeeID,
                    "TreatmentID": service.ID
                }],
                "IncludeCutOffTimes": true
            });
        });
    }
    else{
        console.log('NO SERVICES WERE SELECTED');
    }
    console.log(Itineraries);
    $scope.$emit('wait:start');
    BookerService
        .getAccessTokenFromSS()
        .then(function(access_token){
            access = access_token;
            //var offset =  moment().format('ZZ');
            //var offsetHrs = parseInt(offset.slice(1, 3)) * 60 * 60 * 1000;
            //var offsetmin = parseInt(offset.slice(3, offset.length)) * 60 * 1000;
            var startTimeString = (new Date()).getTime();
            var future = (new Date()).getTime() + 8 * 24 * 60 * 59000;
            var input = {
              EndDateTime: "/Date(" + future + ")/",
              StartDateTime:"/Date(" + startTimeString + ")/",
              Itineraries: Itineraries,
              LocationID: LocationID,
              access_token: access_token
            };

            BookerService
            .runMultiServiceAvailability(input)
            .then(function(data){
              console.log(data);
                $scope.$emit('wait:stop');
                $scope.availableTimeSlots = data.ItineraryTimeSlotsLists[0].ItineraryTimeSlots;
                sessionStorage.locationId = LocationID;

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
                $scope.maxDate = new Date($scope.dates[$scope.dates.length - 1]);

                $scope.selected.selectedDate = $scope.dates[0];
                $scope.$watch('selected.selectedDate', function(newVal, oldVal){
                    $scope.appTimes = finalObjectArr[$scope.selected.selectedDate];
                    $scope.selected.selectedTime = $scope.appTimes[0].index;
                    $scope.FinalSelecetdDate = moment(newVal).format('dddd D MMMM YYYY');
                    $scope.FinalSelecetdTime = (_.find(finalObjectArr[$scope.selected.selectedDate], function(val){
                          return val.index == $scope.selected.selectedTime;
                    })).time;
                });
                $scope.$watch('selected.selectedTime', function(newVal, oldVal){
                    $scope.FinalSelecetdTime = (_.find(finalObjectArr[$scope.selected.selectedDate], function(val){
                          return val.index == $scope.selected.selectedTime;
                    })).time;
                });
            })
            .catch(function(err){
                console.log(err);
                $scope.$emit("notification", {
                    type: 'danger',
                    message: "Server error"
                });
            });
        })
        .catch(function(err){
            $scope.$emit("notification", {
                type: 'danger',
                message: "Server error"
        });
    });
    $scope.cancel = function(){
        sessionStorage.removeItem("IncompleteAppointmentID");
        sessionStorage.removeItem("gift");
        sessionStorage.removeItem("giftAmount");
        $location.path('/Bookings');
    };
    $scope.addIncompleteBooking = function(){
        var amount = 0;
        services.forEach(function(service){
            amount = amount + service.Price.Amount;
        });
        console.log(amount);
        var SelectedTimeSlotAppointment = $scope.availableTimeSlots[$scope.selected.selectedTime];
        var brac = SelectedTimeSlotAppointment.StartDateTime.indexOf('(') + 1;
        var minus = SelectedTimeSlotAppointment.StartDateTime.indexOf(')');
        var selectedTimeStamp = parseInt(SelectedTimeSlotAppointment.StartDateTime.slice(brac, minus));
        appointmentMetaData.IsPackage = SelectedTimeSlotAppointment.IsPackage;
        appointmentMetaData.PackageID = SelectedTimeSlotAppointment.PackageID;
        appointmentMetaData.Amount = amount;
        // appointmentMetaData.Duration = SelectedTimeSlotAppointment.TreatmentTimeSlots[0].Duration;
        appointmentMetaData.EmployeeID = SelectedTimeSlotAppointment.TreatmentTimeSlots[0].EmployeeID;
        appointmentMetaData.CurrencyCode = SelectedTimeSlotAppointment.TreatmentTimeSlots[0].CurrentPrice.CurrencyCode;
        appointmentMetaData.StartDateTime = selectedTimeStamp;
        sessionStorage.appointmentMetaData = JSON.stringify(appointmentMetaData);
        var finalDateTimeStamps = [];
        var index = 0;
        var timeStamp = selectedTimeStamp;
        finalDateTimeStamps.push(selectedTimeStamp);
        services.forEach(function(service, index){
            timeStamp = timeStamp + service.TreatmentDuration * 60 * 1000;
            finalDateTimeStamps.push(timeStamp);
        });
        var data = {
            LocationID: LocationID,
            EmployeeID: appointmentMetaData.EmployeeID,
            access_token: access,
            TreatmentID: treatmentids,
            StartDateTime: finalDateTimeStamps
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
                    $scope.askPayment = sessionStorage.locationPayment == 'true' ? true : false;
                    if($scope.askPayment)
                    {
                      $scope.$emit("notification", {
                          type: 'success',
                          message: "Please Enter Payment Details To Complete Appointment."
                      });
                    }
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
                    message: "Server Error"
                });
                $location.path('/Bookings');
            }
            else
            {
                $scope.$emit("notification", {
                    type: 'success',
                    message: "Incomplete Appointment Booking Failed"
                });
                $location.path('/Bookings');
            }

        })
        .catch(function(err){
            $scope.$emit('wait:stop');
            $scope.$emit("notification", {
                        type: 'danger',
                        message: "Server Error"
            });
            $location.path('/Bookings');
        })
    };
}]);
