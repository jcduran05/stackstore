app.factory('IsAdminFactory', function(AuthService){
	var obj ={}
	obj.isAdmin = function(){
		return AuthService.getLoggedInUser()
		.then(function(user){
			if (user && user.status == 'admin'){
				return true;
			} else {
				return false;
			}
		})
	}
	return obj
})
