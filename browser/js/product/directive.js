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
      scope.addToCart = function(id){
        var name, price;
        scope.products.forEach(function (product){
          if (product.id === id){
            name = product.firstName + ' ' + product.lastName;
            price = product.price;
          }
        })
        bootbox.dialog({
          message: '$' + price,
          title: 'Add ' + name + ' to cart?',
          buttons: {
            success: {
              label: 'Add to cart',
              className: 'btn-success',
              callback: function (){
                console.log('worked')
                CartFactory.addToCart(id)
                .then(function (){
                  $state.reload()
                })
              }
            },
            main: {
              label: 'Express checkout',
              className: 'btn-primary',
              callback: function (){
                CartFactory.addToCart(id)
                .then(function (){
                  $state.go('cart') //eventually make checkout
                })
              }
            },
            danger: {
              label: 'Cancel',
              className:'btn-danger'
            }
          }
        })
        // CartFactory.addToCart(id)
      }


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
