
'use strict'
app.config(function($stateProvider){
	$stateProvider.state('Home', {
		url:'/',
		templateUrl: 'js/home/home.html',
		controller: 'HomeCtrl'
		// resolve: {
		// 	hilary: function(HomeFactory){
		// 		return HomeFactory.hilary()
		// 	}
		// 	,
		// 	donald: function(HomeFactory){
		// 		return HomeFactory.donald()
		// 	}
		// }
	});
})


// app.controller('HomeCtrl', function($scope, $state, HomeFactorys){
// 	$scope.HomeFactorys = HomeFactorys;

//   console.log("HIIIII")
// 	// $scope.hilary = hilary
// 	// $scope.donald = donald
// })


app.controller('HomeCtrl', function($scope, $state, HomeFactorys){
	$scope.myInterval = 5000;
  $scope.slides = [
    {
      image: 'http://a.abcnews.com/images/US/abc_obama_town_hall_wide_cameron_ps_160714_12x5_1600.jpg'
    },
    {
      image: 'http://a.abcnews.com/images/Politics/AP_hillary_clinton_jt_151030_12x5_1600.jpg'
    },
    {
      image: 'http://a.abcnews.com/images/Politics/AP_Trump_MEM_150819_31x13_1600.jpg'
    }
    
  ];


  console.log("HIIIII")
	// $scope.hilary = hilary
	// $scope.donald = donald
})
