app.config(function($stateProvider) {
  $stateProvider.state('checkout', {
    url: '/checkout',
    controller: 'CheckoutController',
    templateUrl: 'js/checkout/checkout.html'
  });
});


app.controller('CheckoutController', function($scope, CartFactory, $state, AuthService) {

  $scope.products = null;
  $scope.incart = true;
  $scope.tots = 0;
  $scope.user = null;

  AuthService.getLoggedInUser()
  .then(function (user){
    $scope.user = user;
  })

  CartFactory.getCart()
    .then(function(cart) {
      cart = cart.map(function(item) {
        $scope.tots += item.price
        item.inCartState = true;
        return item
      })
      $scope.products = cart
    })

  $scope.checkout = function() {
    CartFactory.checkout()
      .then(function(order) {
        $state.go('products')
      })
  }

})
