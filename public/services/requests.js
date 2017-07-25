angular.module('app')

.service('requests', function($http, $window) {
	this.get = (endpoint, data = {}, params, errMsg, callback) => {
		console.log('data from inside get service req ', params)
		$http({
			method: 'GET',
			url: endpoint,
			params: params,
			data: data
		})
		.then(response => {
			callback(response.data);
		})
		.catch(error => console.error(errMsg, error));
	};

	this.post = (endpoint, data, errMsg, callback) => {
		$http({
			method: 'POST',
			url: endpoint,
			data: data
		})
		.then(response => {
			callback(response.data);
		})
		.catch(error => console.error(errMsg, error));
	};

	this.put = (endpoint, data = {}, params = {}, errMsg, callback) => {
		$http({
			method: 'PUT',
			url: endpoint,
			params: params,
			data: data
		})
		.then(response => {
			callback(response.data);
		})
		.catch(error => console.error(errMsg, error));
	};
});
