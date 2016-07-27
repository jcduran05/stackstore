app.config(function($stateProvider) {
  $stateProvider.state('users', {
    url: '/users',
    controller: 'UsersController',
    templateUrl: 'js/users/users.html'
  });

});

app.controller('UsersController', function($scope, $log, UserFactory) {
   UserFactory.fetchAll()
  .then(function(users) {
    $scope.users = users;
  })
  .catch($log.error);

  $scope.delete = function(id) {
    UserFactory.delete(id)
    .then(function(users) {
      $scope.users = users;
    });
  }

});
