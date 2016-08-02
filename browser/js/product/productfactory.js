


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
	product.create = function(obj){
		return $http.post('/api/products/create', obj)

		.then(function(response){
			return response.data
		})
	}

	product.editPrice = function(id, data){
		console.log(id)
		console.log(data)
		return $http.put('/api/products/' + id, data)
		.then(function(response){
			return response.data
		})
	}

	return product
})
