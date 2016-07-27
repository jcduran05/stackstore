app.config(function($stateProvider){
	$stateProvider.state('products', {
		url:'/products',
		templateUrl: 'js/product/products.html',
		controller: 'ProductsCtrl',
		resolve: {
			allProducts: function(productFactory){
				return productFactory.getAll();
			}
		}
	});
});



app.controller('ProductsCtrl', function($scope, $state, allProducts) {

	// return productFactory.getAll()
	// .then(function(politicians){
	// 	$scope.products = politicians;
	// 	console.log($scope.products)

	// }).catch(next)
	$scope.products = allProducts;
	console.log($scope.products)
	

})