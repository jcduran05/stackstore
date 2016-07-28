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


<<<<<<< HEAD

app.controller('ProductsCtrl', function($scope, $state, allProducts) {

	// return productFactory.getAll()
	// .then(function(politicians){
	// 	$scope.products = politicians;
	// 	console.log($scope.products)

	// }).catch(next)
	$scope.products = allProducts;
	console.log($scope.products)
	

})
=======
app.controller('ProductsCtrl', function($scope, $state, allProducts, productFactory) {

	$scope.products = allProducts;
	console.log('hello')

	// $scope.deleter = productFactory.deleteById
	// .then(function(){
	// 	$state.go('products')
	// });

	
});
>>>>>>> 6c499659a8af547ac6cfe74be14e336511b217ed
