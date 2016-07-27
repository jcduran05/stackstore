app.factory('productFactory', function($http){
	var product = {}
	
	product.getAll = function(){
		return $http.get('/api/products')
		.then(function(response){
			return response.data
		})
	}


	return product
})