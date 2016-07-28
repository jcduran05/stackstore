app.config(function($stateProvider) {
  $stateProvider.state('cart', {
    url: '/cart',
    controller: 'CartController',
    templateUrl: 'js/cart/cart.html'
  });
});

app.controller('CartController', function ($scope, CartFactory){

  $scope.cart = null;
  $scope.inCartState = true;

  CartFactory.getCart()
  .then(function (cart) {
    cart = cart.map(function (item){
      item.inCartState = true;
      return item
    })
    $scope.cart = cart
  })

})
