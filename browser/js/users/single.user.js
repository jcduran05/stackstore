
app.config(function($stateProvider) {
  $stateProvider.state('user', {
    url: '/users/:id',
    controller: 'SingleUserController',
    templateUrl: 'js/users/single.user.html'
  });

});

app.controller('SingleUserController', function($scope, $log, UserFactory, $stateParams) {

  $scope.error = null;
  $scope.passwordConfirmed = null;
  $scope.oldPswd = null;
  $scope.edit

   UserFactory.fetchOne($stateParams.id)
  .then(function(user) {
    $scope.user = user;
  })
  .catch(function (err) {
    $scope.error = 'Unauthorized'
    console.error(err)
  });

  $scope.delete = function(id) {
    UserFactory.delete(id)
    .then(function(users) {
      $scope.users = users;
    });
  }

  $scope.confirmPswd = function (oldPswd){
    UserFactory.confirmPswd({pswd: oldPswd}, $scope.user.id)
    .then(function (confirmed){
      $scope.passwordConfirmed = confirmed;
    })
    .catch($log.error)
  }

  $scope.save = function (id){
    if ($scope.pswdCheck !== $scope.newPswd && $scope.newPswd){
      return
    }

    if (!$scope.newPswd){
      delete $scope.user.password
    }
    UserFactory.update(id, $scope.user)
    .then(function(user){
      $scope.user = user
      $scope.edit = null;
      $scope.passwordConfirmed = null;
      $scope.oldPswd = null;
    })
    .catch($log.error)
  }

  $scope.changeForm = function (){
    $scope.edit = true;
  }
});
