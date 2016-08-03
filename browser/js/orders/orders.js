
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



app.config(function($stateProvider) {
  $stateProvider.state('userOrders', {
    url: '/orders/:userId',
    controller: 'UserOrdersController',
    templateUrl: 'js/orders/orders.html'
  });

});

app.controller('UserOrdersController', function($scope, $log, OrderFactory, $state, $stateParams.userId) {

  $scope.orders = null

  OrderFactory.fetchUserOrders($stateParams.userId)
  .then(function (orders){
    $scope.orders = orders
  })

});
