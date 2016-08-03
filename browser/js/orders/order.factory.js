
app.factory('OrderFactory', function($http) {
  var OrderFactory = {};


  OrderFactory.fetchAll = function() {
    return $http.get('/api/orders')
    .then(function(response) {
      return response.data;
    });
  }

  OrderFactory.fetchOne = function(id, userId) {
    return $http.get('/api/orders/' + userId + '/' + id)
    .then(function(response) {
      return response.data;
    })
  }

  OrderFactory.delete = function(id) {
    return $http.delete('/api/orders/' + id)
    .then(function(response) {
      return OrderFactory.fetchAll();
    })
  }

  OrderFactory.update = function(id, orderStatus) {
    return $http.put('/api/orders/' + id, orderStatus)
    .then(function(response) {
      console.log(response);
      return response.data;
    });
  }

  return OrderFactory;
});
