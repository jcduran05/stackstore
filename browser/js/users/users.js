
app.config(function($stateProvider) {
  $stateProvider.state('users', {
    url: '/users',
    controller: 'UsersController',
    templateUrl: 'js/users/users.html'
  });

});

app.controller('UsersController', function($scope, $log, UserFactory, $state) {
  $scope.error = null
  $scope.statuses = ['registered', 'admin'];

   UserFactory.fetchAll()
  .then(function(users) {
    $scope.users = users;
  })
  .catch(function (err){
    $scope.error = 'Unauthorized'
  });

  $scope.update = function(id, user) {
    if (id == $scope.users.id) {
      $state.reload();
      return;
    }
    UserFactory.update(id, user)
    .then(function(user) {
      $state.reload();
    });
  }

  $scope.delete = function(id) {
    UserFactory.delete(id)
    .then(function(users) {
      $scope.users = users;
    });
  }

});
