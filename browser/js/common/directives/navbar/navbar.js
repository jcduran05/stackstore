app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function (scope) {

            scope.items = [
                { label: 'Home', state: 'ourhome' },
                // { label: 'About', state: 'about' },
                // { label: 'Documentation', state: 'docs' },
                // { label: 'Members Only', state: 'membersOnly', auth: true },
                { label: 'All Users', state: 'users', auth: true, admin: true},
                { label: 'All Orders', state: 'orders', auth: true, admin: true},
                { label: 'Politicians', state:'products'},
            ];

            scope.user = null;

            scope.isLoggedIn = function (item) {
                var adminNecessary = item.admin ? true : false
                return adminNecessary ? AuthService.isAuthenticated() && scope.user.status === 'admin' : AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    if($state.includes('ourhome')){
                        $state.reload()
                    }else {$state.go('ourhome')}
                });
            };

            var setUser = function () {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function () {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);

        }

    };

});
