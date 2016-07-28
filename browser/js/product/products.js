app.config(function($stateProvider){
	$stateProvider.state('products', {
		url:'/products',
		templateUrl: 'js/product/templates/products.html',
		controller: 'ProductsCtrl',
		resolve: {
			allProducts: function(productFactory){
				return productFactory.getAll();
			}
		}
	});
});

app.config(function($stateProvider){
	$stateProvider.state('product', {
		url:'/product/:id',
		templateUrl: 'js/product/templates/product.html',
		controller: 'ProductCtrl',
		resolve: {
			oneProduct: function(productFactory, $stateParams){
				return productFactory.getById($stateParams.id);
			}
		}
	});
});



app.controller('ProductsCtrl', function($scope, $state, allProducts, productFactory) {

	$scope.products = allProducts;
	 


		
	
});


app.controller('ProductCtrl', function($scope, $state, oneProduct, productFactory, $stateParams) {

	$scope.product = oneProduct;
	
	
	// productFactory.getById($stateParams.id)
	// .then(function(product){
	// 	$scope.product = product
	// })
	// $state.go('playlist', {playlistId: playlist.id});

		
	
});




// $state.go('playlist', {playlistId: playlist.id});