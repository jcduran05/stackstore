app.factory('RegisterFactory', function($http){
	var register = {}

	register.create = function(data){
		return $http.post('/api/users', data)
		.then(function (user){
			return user.data
		})
	}
	return register

})