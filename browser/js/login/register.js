app.config(function($stateProvider){
	$stateProvider.state('register', {
		url:'/register',
		templateUrl: 'js/login/register.html',
		controller: 'RegisterCtrl'
	});
});


app.controller('RegisterCtrl', function($scope, $state, RegisterFactory, AuthService) {

    $scope.sendRegister = function(){
        RegisterFactory.create($scope.register)
        .then(function(){
            let obj = {email: $scope.register.email, password: $scope.register.password}

            AuthService.login(obj).then(function () {
                $state.go('ourhome');
            }).catch(function () {
                $scope.error = 'Invalid login credentials.';
            });
        })
        .catch(function(){
            $scope.error = 'Email is already registered!'
            $scope.register.email = ''
            $scope.register.password = ''
        })
    }

})
