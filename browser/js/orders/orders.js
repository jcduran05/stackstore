
app.config(function($stateProvider) {
  $stateProvider.state('orders', {
    url: '/orders',
    controller: 'OrdersController',
    templateUrl: 'js/orders/orders.html'
  });

});

app.controller('OrdersController', function($scope, $log, OrderFactory, $state) {

  $scope.orders = null

  OrderFactory.fetchAll()
  .then(function (orders){
    $scope.orders = orders
  })

});
