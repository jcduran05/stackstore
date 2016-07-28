app.directive('testProducts', function(productFactory, $state){
	return {
		restrict:'E',
		scope: {
			products: '='
		},
		templateUrl: 'js/product/index.html',
		link: function(scope){
			scope.deleter = function (id) {
				productFactory.deleteById(id)
				.then(function(res){
					$state.reload()
			
				});
			}
		}
	}
})

// app.directive('singleProduct', function(productFactory, $state){
// 	return {
// 		restrict:'E',
// 		scope: {
// 			products: '='
// 		},
// 		templateUrl: 'js/product/templates/product.html'
// 	}
// })