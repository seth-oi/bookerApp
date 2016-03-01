angular
.module('booker.service.book', [])
.service('booker.service.book.BookerService', ['$http', '$q', 'apiRequestUrl', function($http, $q, apiRequestUrl) {
  return {
  	authenticateAccessToken: function(){
  		console.log('Testing')
  		if(sessionStorage.accessToken && sessionStorage.accessTokenTimeout)
  		{
	  		var currentTimeStamp = (new Date).getTime();
			if(!(currentTimeStamp > sessionStorage.accessTokenTimeout - 30 * 60000)){
				console.log('OK I M FETCHING A NEW token');
				this.getAccessToken();
			}
		}
		else
		{
			this.getAccessToken();
		}
  	},
  	getGoogleId: function(){
  		var deffered = $q.defer();
  		$http({
			method: 'GET',
			url: apiRequestUrl + '/apiRequest/google'
		})
		.then(function(r) {
			deffered.resolve(r.data);
		})
		.catch(function(err){
			deffered.reject(err);
		});
		return deffered.promise;
  	},
  	sendReferralMail: function(input){
  		var deffered = $q.defer();
  		$http({
			method: 'POST',
			url: apiRequestUrl + '/apiRequest/sendEmailReferral',
			data: input
		})
		.then(function(r) {
			deffered.resolve(r.data);
		})
		.catch(function(err){
			deffered.reject(err);
		});
		return deffered.promise;
  	},
  	getFacebookId: function(){
  		var deffered = $q.defer();
  		$http({
			method: 'GET',
			url: apiRequestUrl + '/apiRequest/facebook'
		})
		.then(function(r) {
			deffered.resolve(r.data);
		})
		.catch(function(err){
			deffered.reject(err);
		});
		return deffered.promise;
  	},
  	cancelAppointment: function(input){
  		var deffered = $q.defer();
  		$http({
			method: 'POST',
			url: apiRequestUrl + '/apiRequest/cancel',
			data: input
		})
		.then(function(r) {
			deffered.resolve(r.data);
		})
		.catch(function(err){
			deffered.reject(err);
		});
		return deffered.promise;
  	},
  	createCertificate: function(input){
  		var deffered = $q.defer();
  		$http({
			method: 'POST',
			url: apiRequestUrl + '/apiRequest/createGiftCertificate',
			data: input
		})
		.then(function(r) {
			deffered.resolve(r.data);
		})
		.catch(function(err){
			deffered.reject(err);
		});
		return deffered.promise;
  	},
  	PurchaseGiftCertificate: function(input){
  		var deffered = $q.defer();
  		$http({
			method: 'POST',
			url: apiRequestUrl + '/apiRequest/purchaseGiftCertificate',
			data: input
		})
		.then(function(r) {
			deffered.resolve(r.data);
		})
		.catch(function(err){
			deffered.reject(err);
		});
		return deffered.promise;	
  	},
  	getCustomerAppointments: function(input){
  		var deffered = $q.defer();
  		$http({
			method: 'GET',
			url: apiRequestUrl + '/apiRequest/customer/' + input.CustomerID + '/' + input.access_token
		})
		.then(function(r) {
			deffered.resolve(r.data.Appointments);
		})
		.catch(function(err){
			deffered.reject(err);
		});
		return deffered.promise;
  	},
  	getAccessToken: function() {
  		console.log('INSIDE GET ACCESS TOKEN');
  		var deffered = $q.defer();
		$http({
			method: 'GET',
			url: apiRequestUrl + '/apiRequest'
		})
		.then(function(r) {
			//adding 30 min in millisecs
			var milliseconds = (new Date).getTime() + 30 * 60000;
		 	sessionStorage.accessToken = r.data;
		 	sessionStorage.accessTokenTimeout = milliseconds;
		 	deffered.resolve(r.data);
		})
		.catch(function(err){
			console.log('Error');
			deffered.reject(err);
		});
		return deffered.promise;
	},
	login: function(input) {
		var deffered = $q.defer();
		input.access_token = sessionStorage.accessToken;

		$http({
			url: apiRequestUrl + '/apiRequest/login',
			method: 'POST',
			data: JSON.stringify(input)
		})
		.then(function(r) {
		 	console.log(r);
		 	deffered.resolve(r);
		})
		.catch(function(r){
			console.log('fail' + r);
			deffered.reject(r);
		});
		return deffered.promise;
	},
	createCustomer: function(input) {
		var deffered = $q.defer();
				
		$http({
			url: 'https://apicurrent-app.booker.ninja/WebService4/json/CustomerService.svc/customer',
			type: 'POST',
			data: JSON.stringify(input),
			dataType: 'json',
			contentType: 'application/json',
		})
		.then(function(r) {
		 	console.log(r);
		 	deffered.resolve(r);
		})
		.catch(function(r){
			console.log(r);
			deffered.reject(r);
		});
		
		return deffered.promise;
	},
	getCustomerRewards: function(input){
		var deffered = $q.defer();
		console.log(input);
		$http({
			url: apiRequestUrl + '/apiRequest/getCustomer/'+ input.CustomerID + '/' + input.access_token,
			method: 'GET'
		})
		.then(function(r) {
			deffered.resolve(r.data.LookupOptions);
		})
		.catch(function(r){
			console.log(r);
			deffered.reject(r);
		});
		
		return deffered.promise;
	},
	getCardTypes: function(input){
		var deffered = $q.defer();
		console.log(input);
		$http({
			url: apiRequestUrl + '/apiRequest/cardTypes/'+ input.locationID + '/' + input.access_token,
			method: 'GET'
		})
		.then(function(r) {
			deffered.resolve(r.data.LookupOptions);
		})
		.catch(function(r){
			console.log(r);
			deffered.reject(r);
		});
		
		return deffered.promise;
	},
	createCustomerAndUserAccount: function(input) {
		var deffered = $q.defer();
		$http({
			url: apiRequestUrl + '/apiRequest/register',
			method: 'POST',
			data: input
		})
		.then(function(r) {
		 	deffered.resolve(r);
		})
		.catch(function(r){
			console.log(r);
			deffered.reject(r);
		});
		
		return deffered.promise;
	},
	runServiceAvailability: function(input) {
		var deffered = $q.defer();
		$http({
			url: 'https://apicurrent-app.booker.ninja/WebService4/json/CustomerService.svc/availability/service',
			method: 'POST',
			data: input
		})
		.then(function(r) {
		 	deffered.resolve(r);
		})
		.catch(function(r){
			console.log(r);
			deffered.reject(r);
		});
		
		return deffered.promise;
	},
	findLocations: function (input) {
		var deffered = $q.defer();
		input.access_token = sessionStorage.accessToken;

		$http({
			method: 'POST',
			url: apiRequestUrl + '/apiRequest/locations',
			data: JSON.stringify(input),
			dataType: 'json',
			contentType: 'application/json'
		})
		.then(function(r) {
		 	deffered.resolve(r.data);
		})
		.catch(function(r){
			console.log('fail' + r);
			deffered.reject(r);
		});
		return deffered.promise;
	},
	getLocations: function(input){
		var deffered = $q.defer();
		input.access_token = sessionStorage.accessToken;

		$http({
			method: 'POST',
			url: apiRequestUrl + '/apiRequest/locations',
			data: JSON.stringify(input),
			dataType: 'json',
			contentType: 'application/json'
		})
		.then(function(r) {
		 	console.log(r);
		 	deffered.resolve(r.data);
		})
		.catch(function(r){
			console.log('fail' + r);
			deffered.reject(r);
		});
		return deffered.promise;
	},
	findLocationsGeoAware: function(input) {
		var deffered = $q.defer();
		//input.access_token = sessionStorage.accessToken;

		$http({
			method: 'POST',
			url: apiRequestUrl + '/apiRequest/geoLocations',
			data: JSON.stringify(input),
			dataType: 'json',
			contentType: 'application/json'
		})
		.then(function(r) {
		 	console.log(r);
		 	deffered.resolve(r.data);
		})
		.catch(function(r){
			console.log('fail' + r);
			deffered.reject(r);
		});
		return deffered.promise;
	},

	findTreatments: function(input) {
		var deffered = $q.defer();

		input.access_token = sessionStorage.accessToken;
		$http({
			method: 'POST',
			url: apiRequestUrl + '/apiRequest/services',
			data: JSON.stringify(input),
			dataType: 'json',
			contentType: 'application/json'
		})
		.then(function(r) {
		 	deffered.resolve(r.data);
		})
		.catch(function(r){
			console.log('fail' + r);
			deffered.reject(r);
		});
		return deffered.promise;
	},
	getAccessTokenFromSS: function(){
		var deffered = $q.defer();
		
		if(sessionStorage.accessToken)
		{
			deffered.resolve(sessionStorage.accessToken);
		}
		else
		{
			this
			.getAccessToken()
			.then(function(){
				deffered.resolve(sessionStorage.accessToken);		
			})
		}
		
		return deffered.promise;
	},
	getTreatmentCategories: function() {
		$.ajax({
			url: 'https://apicurrent-app.booker.ninja/WebService4/json/CustomerService.svc/treatment_categories?access_token=42f1dd83-e456-425d-8502-dea0b4ad3d29&culture_name={culture_name}&location_id=3749',
		})
		.success(function(r) {
		 	console.log(r);
		});
	},
	getTreatmentSubCategories: function() {
		$.ajax({
			url: 'https://apicurrent-app.booker.ninja/WebService4/json/CustomerService.svc/treatment_subcategories?access_token=42f1dd83-e456-425d-8502-dea0b4ad3d29&culture_name={culture_name}&location_id=3749&category_id=30',
		})
		.success(function(r) {
		 	console.log(r);
		});
	},
	findEmployees: function(input) {
		var deffered = $q.defer();
		
		$http({
			url: apiRequestUrl + '/apiRequest/employees',
			method: 'POST',
			data: JSON.stringify(input)
		})
		.then(function(r) {
			deffered.resolve(r.data);
		})
		.catch(function(err){
			deffered.reject(r);
		});

		return deffered.promise;
	},
	runMultiServiceAvailability: function(input) {
		var deffered = $q.defer();
		$http({
			url: apiRequestUrl + '/apiRequest/availability',
			method: 'POST',
			data: JSON.stringify(input)
		})
		.then(function(r) {
		 	console.log(r);
		 	deffered.resolve(r.data);
		})
		.catch(function(err){
			console.log(err);
			deffered.reject(err);
		});
		return deffered.promise;
	},
	createIncompleteAppointment: function(input) {
		console.log(input);
		var deffered = $q.defer();
		$http({
			url: apiRequestUrl + '/apiRequest/IncompleteBooking',
			method: 'POST',
			data: JSON.stringify(input),
			dataType: 'json',
			contentType: 'application/json',
		})
		.then(function(r) {
			console.log(r);
			deffered.resolve(r.data);
		})
		.catch(function(err){
			console.log(err)
			deffered.reject(err);
		});
		return deffered.promise;
	},
	createAppointment: function(input) {
		var deffered = $q.defer();
		$http({
			url: apiRequestUrl + '/apiRequest/CompleteBooking',
			method: 'POST',
			data: JSON.stringify(input),
			dataType: 'json',
			contentType: 'application/json',
		})
		.then(function(r) {
			console.log(r);
			deffered.resolve(r.data);
		})
		.catch(function(err){
			console.log(err)
			deffered.reject(err);
		});
		return deffered.promise;
	},
	getGiftTemplates: function(input){
		var deffered = $q.defer();
		console.log(input);
		$http({
			url: apiRequestUrl + '/apiRequest/getGiftTemplates/'+ input.locationID + '/' + input.access_token,
			method: 'GET'
		})
		.then(function(r) {
			deffered.resolve(r.data);
		})
		.catch(function(r){
			console.log(r);
			deffered.reject(r);
		});
		
		return deffered.promise;
	},
	getSpecialByCode: function() {
		$.ajax({
			url: 'https://apicurrent-app.booker.ninja/WebService4/json/CustomerService.svc/special/location/{id}?access_token=0b3220fe-d2e4-4590-b092-86c48cf9634b&couponcode={couponcode}&bookingdate={bookingdate}&appointmentdate={appointmentdate}&validate={validate}',
		})
		.success(function(r) {
		 	console.log(r);
		});
	}
  }
}]);