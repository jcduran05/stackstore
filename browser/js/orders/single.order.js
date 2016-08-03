
app.config(function($stateProvider) {
  $stateProvider.state('order', {
    url: '/orders/:userId/:id',
    controller: 'SingleOrderController',
    templateUrl: 'js/orders/single.order.html'
  });

});

app.controller('SingleOrderController', function($scope, $log, OrderFactory, $state, $stateParams) {

  $scope.order = null

  OrderFactory.fetchOne($stateParams.id)
  .then(function(data){
    $scope.order = data.order
    $scope.products = data.products.map(function (product, i){
      product.price = $scope.order.productPrices[i];
      return product
    })
    $scope.user = data.user
  })

});
