app.factory('productFactory', function($http){
	var product = {}
	
	product.getAll = function(){
		return $http.get('/api/products')
		.then(function(response){
			return response.data
		})
	}
	product.deleteById = function(id){
		return $http.delete('/api/products/' + id)
			.then(function(response){
				return response.data
			})
	}
	product.getById = function(id){
		return $http.get('/api/products/' + id)
		.then(function(response){
			return response.data
		})
	}

	return product
})