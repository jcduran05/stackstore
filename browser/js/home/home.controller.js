
'use strict'
app.config(function($stateProvider){
	$stateProvider.state('ourhome', {
		url:'/',
		templateUrl: 'js/home/home.html',
		controller: 'HomeCtrl'

	});
})

app.controller('HomeCtrl', function($scope, $state, HomeFactorys,productFactory){

  $scope.incart = true

	productFactory.getAll()
		.then(function(products){
			$scope.hot = products.filter(function (product){
        return product.firstName == 'Hillary' || product.firstName == 'Donald' || product.firstName == 'Bernie' || product.firstName == 'Barack'
      })
		});

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

})

