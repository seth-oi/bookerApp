angular
.module('payment', ['booker.service.book'])
.controller('paymentController', ['$scope', '$location', '$routeParams', 'booker.service.book.BookerService',  function($scope, $location,$routeParams, BookerService){
	$scope.$emit('wait:start');
    $scope.cardSelected = {
        ID: 1
    };
    //route params is a string not boolean
    if($routeParams.gift == 'false')
    {
        $scope.giftButton = false;
        var appointmentData = JSON.parse(sessionStorage.appointmentMetaData);
        $scope.payment = {
            expirationDate: null,
            billingZip: null,
            cardName: null,
            cardNumber: null,
            securityCode: null,
            amount: appointmentData.Amount
        };
        $scope.disabled = true;
    }
    else
    {
        $scope.giftButton = true;
        $scope.payment = {
            expirationDate: null,
            billingZip: null,
            cardName: null,
            cardNumber: null,
            securityCode: null,
            amount: 0
        };
        $scope.disabled = false;
    }
    

	BookerService
    .getAccessTokenFromSS()
    .then(function(access_token){
        
    	$scope.access_token = access_token;
        var input = {
          access_token: access_token,
          locationID: sessionStorage.locationID
        };
        BookerService
        .getCardTypes(input)
        .then(function(types){
            $scope.$emit('wait:stop');
            console.log(types);
            $scope.cardTypes = types;
            $scope.cardSelected.ID = $scope.cardTypes[0].ID;
            console.log($scope.cardSelected);
        })
        .catch(function(err){
            console.log(err);
            $scope.$emit("notification", {
                type: 'danger',
                message: "Error Occured. Please Try again."
            });
        })

    })
    .catch(function(err){
        console.log(err);
        $scope.$emit("notification", {
                type: 'danger',
                message: err.data || "Server error"
        });
    });
    $scope.CancelBooking = function(){
        sessionStorage.removeItem("IncompleteAppointmentID");
        sessionStorage.removeItem("gift");
        sessionStorage.removeItem("giftAmount");
        $location.path('/Bookings');
    }
    $scope.sendEGiftCard = function(){
        var res = _.find($scope.cardTypes, {ID: $scope.cardSelected.ID});
        if(sessionStorage.User == "null")
        {
            sessionStorage.User = null;   
            $location.path('/login');
            return;
        }
        if(sessionStorage.IncompleteAppointmentID == "null"){
            $scope.$emit("notification", {
                type: 'danger',
                message: "Error Occured. Please Try again."
            });
            sessionStorage.User = null;
            $location.path('/login');
            return;
        }
        console.log(!$scope.payment.securityCode);
        console.log(isNaN($scope.payment.securityCode));
        console.log(parseInt($scope.payment.securityCode) > 0);
        console.log($scope.payment.securityCode.length <= 3|| $scope.payment.securityCode.length >= 5);
        if(!$scope.payment.securityCode || isNaN($scope.payment.securityCode) || !(parseInt($scope.payment.securityCode) > 0) || $scope.payment.securityCode.length <= 3|| $scope.payment.securityCode.length >= 5)
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Enter a valid 3-5 digit Security Code"
            });
            return;
        }
        if(!$scope.payment.cardName)
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Enter a valid Card Name"
            });
            return;
        }
        if(!$scope.payment.cardNumber || isNaN(parseInt($scope.payment.cardNumber)) || !(parseInt($scope.payment.cardNumber) > 0))
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Enter a valid Card Number"
            });
            return;
        }
        if(!$scope.payment.billingZip || isNaN(parseInt($scope.payment.billingZip)) || !(parseInt($scope.payment.billingZip) > 0))
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Enter a valid Billing Zip"
            });
            return;
        }
        if(!$scope.payment.expirationDate)
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Select a expiration date"
            });
            return;
        }
        else {
            var year = moment($scope.payment.expirationDate.toString()).year();
            var currentYear = moment();
            if(year < currentYear.year())
            {
                $scope.$emit("notification", {
                    type: 'info',
                    message: "Expiration Date(year) not valid."
                });
                return;
            }
            else if(year == currentYear.year())
            {
                var month = moment($scope.payment.expirationDate.toString()).month() + 1;
                var currentMonth = moment();
                if(month <= currentMonth.month())
                {
                    $scope.$emit("notification", {
                        type: 'info',
                        message: "Expiration Date(month) not valid."
                    });
                    return;
                }
            }
        }
        var dateUnix = parseInt(moment($scope.payment.expirationDate).unix()) * 1000;
        var finaldateUnix = dateUnix.toString() + '- 0000';
        var user = JSON.parse(sessionStorage.User);
        var access_token = sessionStorage.accessToken;
        var GiftCertificate = sessionStorage.gift ? JSON.parse(sessionStorage.gift) : {}
        var finalObject = {
            "CustomerPhone": user.Customer.HomePhone || "",
            "CustomerLastName": user.Customer.LastName || "",
            "CustomerFirstName": user.Customer.FirstName || "",
            "CustomerEmail": user.Customer.Email,
            "CustomerGuid": user.Customer.GUID,
            "CustomerID": user.Customer.ID,
            "LocationID": sessionStorage.locationID,
            "access_token": access_token,
            "GiftCertificateID": GiftCertificate.GiftCertificateID,
            "PaymentItem": {
                    Method: {
                        "ID": 1,
                        "Name": "CreditCard"
                    },
                    Amount:{
                        Amount: sessionStorage.giftAmount,
                        CurrencyCode: ""
                    },
                    CreditCard: {
                        SecurityCode: $scope.payment.securityCode.toString(),
                        Number: "374720202293610",
                        NameOnCard:$scope.payment.cardName,
                        BillingZip:$scope.payment.billingZip,
                        ExpirationDate: "/Date(" + finaldateUnix + ")/",
                        Type: {
                            ID: 1,
                            Name: "AmericanExpress"
                        },
                        iDynamoSwipeData: ""
                    },
                    GiftCertificate: {
                        "Number": "",
                        "Type": {
                            "ID": 1,
                            "Name": ""
                        }
                    },
                    "CustomPaymentMethodID": null
                },
           "SendEmailReceipt": true
        };         
        $scope.$emit('wait:start');
        BookerService
        .PurchaseGiftCertificate(finalObject)
        .then(function(data){
            console.log(data);
                sessionStorage.removeItem('giftAmount');
                sessionStorage.removeItem('gift');
                $scope.$emit('wait:stop');
                if(data.IsSuccess)
                {
                    $scope.$emit("notification", {
                        type: 'success',
                        message: "Your E-Gift Certificate Has Been Created Sent"
                    });
                }
                else if (data.ArgumentErrors || data.ErrorMessage)
                {
                    var message = '';
                    if(data.ArgumentErrors)
                    {
                        data.ArgumentErrors.forEach(function(err){
                        message = message + err.ArgumentName + err.ErrorMessage;
                    })
                        $scope.$emit("notification", {
                            type: 'danger',
                            message: message
                        });    
                    }
                    else{
                        $scope.$emit("notification", {
                            type: 'danger',
                            message: data.ErrorMessage
                        });   
                    }
                    
                }
                else
                {
                    $scope.$emit("notification", {
                        type: 'danger',
                        message: "We're sorry, Please Try Again Later."
                    });   
                }
            })
            .catch(function(err){
                console.log(err);
                $scope.$emit("notification", {
                        type: 'danger',
                        message: err.data || "Server error"
                });
            });
    };
    $scope.submitPaymentDetails = function(){
        var res = _.find($scope.cardTypes, {ID: $scope.cardSelected.ID});
        if(sessionStorage.User == "null")
        {
            sessionStorage.User = null;   
            $location.path('/login');
            return;
        }
        if(sessionStorage.IncompleteAppointmentID == "null"){
            $scope.$emit("notification", {
                type: 'danger',
                message: "Error Occured. Please Try again."
            });
            sessionStorage.User = null;
            $location.path('/login');
            return;
        }
        if(!$scope.payment.securityCode || isNaN(parseInt($scope.payment.securityCode)) || !(parseInt($scope.payment.securityCode) > 0) || $scope.payment.securityCode.length <= 3|| $scope.payment.securityCode.length >= 5)
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Enter a valid 3-5 digit Security Code"
            });
            return;
        }
        if(!$scope.payment.cardNumber || isNaN($scope.payment.cardNumber) || !(parseInt($scope.payment.cardNumber) > 0))
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Enter a valid Card Number"
            });
            return;
        }
        if(!$scope.payment.cardName)
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Enter a valid Card Name"
            });
            return;
        }
        if(!$scope.payment.billingZip || isNaN($scope.payment.billingZip) || !(parseInt($scope.payment.billingZip) > 0))
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Enter a valid Billing Zip"
            });
            return;
        }
        if(!$scope.payment.expirationDate)
        {
            $scope.$emit("notification", {
                type: 'info',
                message: "Please Select a expiration date"
            });
            return;
        }
        else {
            var year = moment($scope.payment.expirationDate.toString()).year();
            var currentYear = moment();
            if(year < currentYear.year())
            {
                $scope.$emit("notification", {
                    type: 'info',
                    message: "Expiration Date(year) not valid."
                });
                return;
            }
            else if(year == currentYear.year())
            {
                var month = moment($scope.payment.expirationDate.toString()).month() + 1;
                var currentMonth = moment();
                if(month <= currentMonth.month())
                {
                    $scope.$emit("notification", {
                        type: 'info',
                        message: "Expiration Date(month) not valid."
                    });
                    return;
                }
            }
        }
        var dateUnix = parseInt(moment($scope.payment.expirationDate).unix()) * 1000;
        var finaldateUnix = dateUnix.toString() + '- 0000';
        var user = JSON.parse(sessionStorage.User);
        var IncompleteAppointmentID = JSON.parse(sessionStorage.IncompleteAppointmentID);
        var appointmentData = JSON.parse(sessionStorage.appointmentData);
        var appointmentMetaData = JSON.parse(sessionStorage.appointmentMetaData);
        var access_token = sessionStorage.accessToken;
        var finalObject = {
            Customer: {
                MobilePhone: user.Customer.CellPhone || "",
                LastName: user.Customer.LastName || "",
                HomePhone: user.Customer.HomePhone || "",
                FirstName: user.Customer.FirstName || "",
                Email: user.Customer.Email,
                ID: user.Customer.CustomerID
            },
            AppointmentPayment: {
                PaymentItem: {
                    Amount:{
                        Amount: appointmentMetaData.Amount,
                        CurrencyCode: appointmentMetaData.CurrencyCode
                    },
                    CreditCard: {
                        SecurityCode: $scope.payment.securityCode.toString(),
                        Number: "374720202293610",
                        NameOnCard:$scope.payment.cardName,
                        BillingZip:$scope.payment.billingZip,
                        ExpirationDate: "/Date(" + finaldateUnix + ")/",
                        Type: {
                            ID: 1,
                            Name: "AmericanExpress"
                        },
                        iDynamoSwipeData: ""
                    },
                    GiftCertificate: {
                        "Number": "",
                        "Type": {
                            "ID": null,
                            "Name": ""
                        }
                    },
                    Method: {
                        "ID": 1,
                        "Name": "CreditCard"
                    },
                    "CustomPaymentMethodID": null
                },
                CouponCode: ""
            },
            IncompleteAppointmentID: IncompleteAppointmentID,
            ItineraryTimeSlotList: [{
                CurrentPackagePrice: {
                    Amount: appointmentMetaData.Amount,
                    CurrencyCode: appointmentMetaData.CurrencyCode
                },
                IsPackage: appointmentMetaData.IsPackage || false,
                PackageID: appointmentMetaData.PackageID || null,
                LocationID: appointmentData.LocationID || sessionStorage.locationId,
                access_token: access_token,
                StartDateTime: "/Date(" + appointmentMetaData.StartDateTime + ")/",
                PrefferedStaffGender: null,
                TreatmentTimeSlots:[{
                    CurrentPrice:{
                        Amount: appointmentMetaData.Amount,
                        CurrencyCode: appointmentMetaData.CurrencyCode
                    },
                    Duration: appointmentMetaData.Duration,
                    EmployeeID: appointmentMetaData.EmployeeID,
                    StartDateTime: "/Date(" + appointmentMetaData.StartDateTime + ")/",
                    TreatmentID: appointmentData.TreatmentID,
                    RoomID: null,
                    Employee2ID: null
                }]
            }],
            LocationID:appointmentData.LocationID,
            access_token: access_token
        };
        $scope.$emit('wait:start');
        BookerService
        .createAppointment(finalObject)
        .then(function(data){
                sessionStorage.removeItem('IncompleteAppointmentID');
                $scope.$emit('wait:stop');
                if(data.IsSuccess)
                {
                    $scope.$emit("notification", {
                        type: 'success',
                        message: "Your Appointment Has Been Created Successfully"
                    }); 
                   $scope.access_token = access_token;
                   $location.path('/manage');
                }
                else if (data.ArgumentErrors || data.ErrorMessage)
                {
                    var message = '';
                    if(data.ArgumentErrors)
                    {
                        data.ArgumentErrors.forEach(function(err){
                            message = message + err.ArgumentName + err.ErrorMessage;
                        })    
                    }
                    else
                    {
                        message = data.ErrorMessage;
                    }                    
                    $scope.$emit("notification", {
                        type: 'danger',
                        message: message
                    });
                    $location.path('/booking');   
                }
                else
                {
                    $scope.$emit("notification", {
                        type: 'danger',
                        message: "We're sorry, but the appointment time you requested is no longer available."
                    });   
                    $location.path('/booking');
                }
            })
            .catch(function(err){
                console.log(err);
                $scope.$emit("notification", {
                        type: 'danger',
                        message: err.data || "Server error"
                });
            });
    };
}]);
