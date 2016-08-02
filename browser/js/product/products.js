

// var appp = angular.module("appp", ["xeditable"]);
// appp.run(function(editableOptions) {
//   editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
// });


app.config(function($stateProvider){
	$stateProvider.state('products', {
		url:'/products',
		templateUrl: 'js/product/templates/products.html',
		controller: 'ProductsCtrl',
		resolve: {
			allProducts: function(productFactory){
				return productFactory.getAll()
			}
		}
	});
});

app.config(function($stateProvider){
	$stateProvider.state('product', {
		url:'/product/:id',
		templateUrl: 'js/product/templates/singleProduct.html',
		controller: 'ProductCtrl',
		resolve: {
			oneProduct: function(productFactory, $stateParams){
				return productFactory.getById($stateParams.id);
			}
		}
	});
});



app.controller('ProductsCtrl', function($scope, $state, allProducts, productFactory, IsAdminFactory) {
	$scope.newProduct={}
	$scope.products = allProducts;
	 $scope.addUser = function(){
	 	console.log($scope.newProduct)
        productFactory.create($scope.newProduct)
        .then(function(res){
          $state.reload();
        }); 
      }
      IsAdminFactory.isAdmin()
      .then(function(status){
      $scope.isAdmin = status;
       })
});


app.controller('ProductCtrl', function($scope, $rootScope, oneProduct, CartFactory, reviewFactory, $stateParams) {

	$scope.product = oneProduct;
	$scope.max = 5;

  // Review related
	$scope.error = null
	$scope.reviewSuccess = null
	$scope.showReview = false;

	$scope.showReviewForm = function () {
	  if($rootScope.user) {
	    $scope.showReview = true;

	    $scope.review = {};

	    // If current user has submitted a review for this
	    // product, load that data into the form
	    if ($scope.product.reviews) {
	    	$scope.product.reviews.forEach(function(reviewObj) {
	    		if (reviewObj.userId == $rootScope.user.id) {
	    			$scope.review.title = reviewObj.title;
	    			$scope.review.content = reviewObj.content;
	    			$scope.review.reviewId = reviewObj.id;
	    			$scope.review.rating = reviewObj.rating;
	    		}
	    	});
	    }
	  } else {
	  	// Only allow logged in users to view the form
	    $scope.error = 'Must be logged in to write a review.';
	  }
	}

	$scope.sendReview = function (review) {
		if(!$rootScope.user) {
			$scope.error = 'Must be logged in to write a review.';
			return;
	  }

	  // If user already submitted a review
	  // for this product, update the review
	  if ($scope.review.reviewId) {
		  reviewFactory.update(review, $stateParams.id, review.reviewId)
		  .then(function(review) {
		  		$scope.reviewSuccess = 'Review updated.';
		  		return reviewFactory.fetchAll($stateParams.id);
		  })
			.then(function(reviews) {
				$scope.product.reviews = reviews;
			})
	    .catch(function (err) {
      $scope.error = err.message || 'Something went wrong!';
    	});
		} else {
		  // New review. This use has not submitted
		  // a review for this product
			reviewFactory.create(review, $stateParams.id)
			.then(function(review) {
				$scope.reviewSuccess = 'Review created.';
				return reviewFactory.fetchAll($stateParams.id);
			})
			.then(function(reviews) {
				$scope.product.reviews = reviews;
			})
	    .catch(function (err) {
      $scope.error = err.message || 'Something went wrong!';
    	});
		}
	}

});




// $state.go('playlist', {playlistId: playlist.id});
