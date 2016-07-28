app.factory('CartFactory', function ($http){

  var CartFactory = {}

  CartFactory.getCart = function (){
    return $http.get('/api/cart')
    .then(function (res){
      return res.data
    })
  }

  CartFactory.addToCart = function (id){
    return $http.post('api/cart/add/' + id)
    .then(function (res){
      return res.data
    })
  }

  CartFactory.removeFromCart = function (id){
    return $http.delete('api/cart/delete/' + id)
    .then(function (res){
      return res.data
    })
  }

  return CartFactory

})
