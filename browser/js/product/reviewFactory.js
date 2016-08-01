app.factory('reviewFactory', function($http){
  var reviewFactory = {}

  reviewFactory.create = function(review, productId) {
    return $http.post('/api/products/' + productId + '/review', review)
    .then(function(response){
      return response.data
    })
  }

  reviewFactory.update = function(review, productId, reviewId) {
    return $http.put('/api/products/' + productId + '/review/' + reviewId, review)
      .then(function(response){
        return response.data
      })
  }

  reviewFactory.fetchAll = function(productId) {
    return $http.get('/api/products/' + productId + '/review')
    .then(function(response) {
      return response.data
    });
  }

  return reviewFactory
})
