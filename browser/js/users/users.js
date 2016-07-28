app.config(function($stateProvider) {
  $stateProvider.state('users', {
    url: '/users',
    controller: 'UsersController',
    templateUrl: 'js/users/users.html'
  });

});

app.controller('UsersController', function($scope, $log, UserFactory) {
  $scope.error = null
   UserFactory.fetchAll()
  .then(function(users) {
    $scope.users = users;
  })
  .catch(function (err){
    $scope.error = 'Unauthorized'
    console.error(err)
  });

  $scope.delete = function(id) {
    UserFactory.delete(id)
    .then(function(users) {
      $scope.users = users;
    });
  }

});
