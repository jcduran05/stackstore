app.factory('HomeFactory', function($http, productFactory){
	var obj = {};
	// var donald = 102;
	// var hilary = 101;
	// obj.donald = productFactory.getById(donald)


	obj.hilary = function(){
		return $http.get('/api/products/101')
		.then(function(response){
			return response.data
		})
	}
	obj.donald = function(){
		return $http.get('/api/products/102')
		.then(function(response){
			return response.data
		})
	}





	return obj

	
})