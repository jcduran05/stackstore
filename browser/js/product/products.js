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
		template: '<single-product product="product"></single-product>',
		controller: 'ProductCtrl',
		resolve: {
			oneProduct: function(productFactory, $stateParams){
				return productFactory.getById($stateParams.id);
			}
		}
	});
});



app.controller('ProductsCtrl', function($scope, $state, allProducts) {

	$scope.products = allProducts;

});


app.controller('ProductCtrl', function($scope, oneProduct, CartFactory) {

	$scope.product = oneProduct;

});




// $state.go('playlist', {playlistId: playlist.id});
