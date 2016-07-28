app.directive('testProducts', function(productFactory, $state, CartFactory){
	return {
		restrict:'E',
		scope: {
			products: '=',
      inCartState: '='
		},
		templateUrl: 'js/product/index.html',
		link: function(scope){

			scope.deleter = function (id) {
				productFactory.deleteById(id)
				.then(function(res){
					$state.reload()
				});
			}
      scope.addToCart = CartFactory.addToCart
      scope.removeFromCart = function (id){
        CartFactory.removeFromCart(id)
        .then(function (cart){
          $state.reload()
        })
      }

		}
	}
})

app.directive('singleProduct', function(productFactory, $state, CartFactory){
	return {
		restrict:'E',
		scope: {
			product: '='
		},
		templateUrl: 'js/product/templates/product.html',
    link: function (scope, elem, attrs){
      scope.addToCart = CartFactory.addToCart
    }
	}
})
