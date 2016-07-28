app.factory('UserFactory', function($http) {
  var UserObj = {};

  UserObj.fetchAll = function() {
    return $http.get('/api/users')
    .then(function(response) {
      return response.data;
    });
  }

  UserObj.fetchOne = function(id) {
    return $http.get('/api/users/' + id)
    .then(function(response) {
      return response.data;
    });
  }

  UserObj.delete = function(id) {
    return $http.delete('/api/users/' + id)
    .then(function(response) {
      return UserObj.fetchAll();
    })
  }

  UserObj.update = function(id) {
    return $http.put('/api/users/' + id)
    .then(function(response) {
      return response.data;
    });
  }

  UserObj.create = function(data) {
    return $http.post('/api/users', data)
    .then(function(response) {
      return response.data;
    });
  }

  return UserObj;
});
