app.config(function($stateProvider){
	$stateProvider.state('ourhome', {
		url:'/',
		templateUrl: 'js/home/home.html',
		controller: 'HomeCtrl',
		resolve: {
			hilary: function(HomeFactory){
				return HomeFactory.hilary()
			}
			,
			donald: function(HomeFactory){
				return HomeFactory.donald()
			}
		}
	});
});


app.controller('HomeCtrl', function($scope, $state, HomeFactory, hilary, donald){
	$scope.hilary = hilary
	$scope.donald = donald
})