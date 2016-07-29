app.config(function($stateProvider) {
  $stateProvider.state('checkout', {
    url: '/checkout',
    controller: 'CheckoutController',
    templateUrl: 'js/checkout/checkout.html'
  });
});


app.controller('CheckoutController', function($scope, CartFactory, $state) {

  $scope.checkout = function() {
    CartFactory.checkout()
      .then(function(order) {
        $state.go('products')
      })
  }

})
