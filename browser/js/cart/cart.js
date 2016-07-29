app.config(function($stateProvider) {
  $stateProvider.state('cart', {
    url: '/cart',
    controller: 'CartController',
    templateUrl: 'js/cart/cart.html'
  });
});

app.controller('CartController', function($scope, CartFactory, $state) {

  $scope.cart = null;
  $scope.incart = true;
  console.log('are you updating')
  CartFactory.getCart()
    .then(function(cart) {
      cart = cart.map(function(item) {
        item.inCartState = true;
        return item
      })
      $scope.cart = cart
    })

  $scope.checkout = function() {
    $state.go('checkout')
  }

})
