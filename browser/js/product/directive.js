


app.directive('testProducts', function(productFactory, $state, CartFactory, IsAdminFactory, $rootScope){
	return {
		restrict:'E',
		scope: {
			products: '=',
      incart: '=',
      inorder: '='
		},
		templateUrl: 'js/product/index.html',

		link: function (scope){
      scope.isAdmin = null;

      if($rootScope.user) scope.isAdmin = ($rootScope.user.status === "admin" ? true: false)
      else scope.isAdmin = false

      scope.priceSearch = '';
      scope.below = function (product){
        if (product.price < scope.priceSearch || scope.priceSearch == '') {
          return true;
        }
        return false;
      }


      IsAdminFactory.isAdmin()
      .then(function(status){
        scope.isAdmin = status;
      })


      scope.turnon = false;
      scope.switch = function(){
        scope.turnon = !scope.turnon
      }

      scope.deleter = function (id) {
        productFactory.deleteById(id)
        .then(function(res){
          $state.reload()
        });
      }

      scope.editPrice = function(id, product, $data){
        product.price = $data;
        productFactory.editPrice(id, product)
        .then(function(item){
          $state.reload();
        })
      }

      scope.editParty = function(id, product, $data){
        product.party = $data;
        productFactory.editPrice(id, product)
        .then(function(item){
          $state.reload();
        })
      }

      scope.editState = function(id, product, $data){
        product.state = $data;
        productFactory.editPrice(id, product)
        .then(function(item){
          $state.reload();
        })
      }

      scope.editFirstName = function(id, product, $data){
        product.firstName = $data;
        productFactory.editPrice(id, product)
        .then(function(item){
          $state.reload();
        })
      }

      scope.editLastName = function(id, product, $data){
        product.lastName = $data;
        productFactory.editPrice(id, product)
        .then(function(item){
          $state.reload();
        })
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
                  $state.go('checkout') //eventually make checkout
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

app.directive('singleProduct', function(productFactory, $state, CartFactory, IsAdminFactory){
	return {
		restrict:'E',
		scope: {
			product: '='
		},
		templateUrl: 'js/product/templates/product.html',
    link: function (scope){
      scope.isAdmin = null;

      IsAdminFactory.isAdmin()
      .then(function(status){
        scope.isAdmin = status;
      })

      scope.deleter = function (id) {
        productFactory.deleteById(id)
        .then(function(res){
          $state.reload()
        });
      }
      scope.addToCart = function(id){
        bootbox.dialog({
          message: '$' + scope.product.price,
          title: 'Add ' + scope.product.firstName + ' ' + scope.product.lastName + ' to cart?',
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
                  $state.go('checkout') //eventually make checkout
                })
              }
            },
            danger: {
              label: 'Cancel',
              className:'btn-danger'
            }
          }
        })
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
