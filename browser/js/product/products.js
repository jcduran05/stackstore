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


app.controller('ProductsCtrl', function($scope, $state, allProducts, productFactory) {

	$scope.products = allProducts;
	console.log('hello')

	// $scope.deleter = productFactory.deleteById
	// .then(function(){
	// 	$state.go('products')
	// });

	
});