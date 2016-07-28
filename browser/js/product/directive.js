app.directive('testProducts', function(){
	return {
		restrict:'E',
		scope: {
			products: '='
		},
		templateUrl: 'js/product/index.html'
	}
})