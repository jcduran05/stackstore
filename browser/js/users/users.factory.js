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

  UserObj.update = function(id, userData) {
    return $http.put('/api/users/' + id, userData)
    .then(function(response) {
      console.log(response);
      return response.data;
    });
  }

  UserObj.create = function(data) {
    return $http.post('/api/users', data)
    .then(function(response) {
      return response.data;
    });
  }

  UserObj.confirmPswd = function (pswd, id){
    return $http.put('/api/users/' + id + '/confirm', pswd)
    .then(function (response){
      return response.data
    })
  }

  return UserObj;
});
