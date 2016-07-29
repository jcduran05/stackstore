'use strict';

window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
    // Trigger page refresh when accessing an OAuth route
    $urlRouterProvider.when('/auth/:provider', function () {
        window.location.reload();
    });
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

    AuthService.getLoggedInUser().then(function (user) {
        if (user) $rootScope.user = user;
    });

    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
        return state.data && state.data.authenticate;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });
    });
});

app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/about',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html'
    });
});

app.controller('AboutController', function ($scope, FullstackPics) {

    // Images of beautiful Fullstack people.
    $scope.images = _.shuffle(FullstackPics);
});
app.config(function ($stateProvider) {
    $stateProvider.state('docs', {
        url: '/docs',
        templateUrl: 'js/docs/docs.html'
    });
});

(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.

    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('Socket', function () {
        if (!window.io) throw new Error('socket.io not found!');
        return window.io(window.location.origin);
    });

    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function responseError(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.getLoggedInUser = function (fromServer) {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.

            // Optionally, if true is given as the fromServer parameter,
            // then this cached value will not be used.

            if (this.isAuthenticated() && fromServer !== true) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get('/session').then(onSuccessfulLogin).catch(function () {
                return null;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin).catch(function () {
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };
    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };
    });
})();

app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state, $rootScope) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {
        $scope.error = null;

        AuthService.login(loginInfo).then(function (user) {
            $rootScope.user = user;
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });
    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('register', {
        url: '/register',
        templateUrl: 'js/login/register.html',
        controller: 'RegisterCtrl'
    });
});

app.controller('RegisterCtrl', function ($scope, $state, RegisterFactory, AuthService) {

    $scope.sendRegister = function () {
        RegisterFactory.create($scope.register).then(function () {
            var obj = { email: $scope.register.email, password: $scope.register.password };

            AuthService.login(obj).then(function () {
                $state.go('home');
            }).catch(function () {
                $scope.error = 'Invalid login credentials.';
            });
        }).catch(function () {
            $scope.error = 'Email is already registered!';
            $scope.register.email = '';
            $scope.register.password = '';
        });
    };
});

app.factory('RegisterFactory', function ($http) {
    var register = {};

    register.create = function (data) {
        return $http.post('/api/users', data).then(function (user) {
            return user.data;
        });
    };
    return register;
});
app.config(function ($stateProvider) {

    $stateProvider.state('membersOnly', {
        url: '/members-area',
        template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
        controller: function controller($scope, SecretStash) {
            SecretStash.getStash().then(function (stash) {
                $scope.stash = stash;
            });
        },
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });
});

app.factory('SecretStash', function ($http) {

    var getStash = function getStash() {
        return $http.get('/api/members/secret-stash').then(function (response) {
            return response.data;
        });
    };

    return {
        getStash: getStash
    };
});
app.directive('testProducts', function (productFactory, $state) {
    return {
        restrict: 'E',
        scope: {
            products: '='
        },
        templateUrl: 'js/product/index.html',
        link: function link(scope) {
            scope.deleter = function (id) {
                productFactory.deleteById(id).then(function (res) {
                    $state.reload();
                });
            };
        }
    };
});

// app.directive('singleProduct', function(productFactory, $state){
// 	return {
// 		restrict:'E',
// 		scope: {
// 			products: '='
// 		},
// 		templateUrl: 'js/product/templates/product.html'
// 	}
// })
app.factory('productFactory', function ($http) {
    var product = {};

    product.getAll = function () {
        return $http.get('/api/products').then(function (response) {
            return response.data;
        });
    };
    product.deleteById = function (id) {
        return $http.delete('/api/products/' + id).then(function (response) {
            return response.data;
        });
    };
    product.getById = function (id) {
        return $http.get('/api/products/' + id).then(function (response) {
            return response.data;
        });
    };

    return product;
});
app.config(function ($stateProvider) {
    $stateProvider.state('products', {
        url: '/products',
        templateUrl: 'js/product/templates/products.html',
        controller: 'ProductsCtrl',
        resolve: {
            allProducts: function allProducts(productFactory) {
                return productFactory.getAll();
            }
        }
    });
});

app.config(function ($stateProvider) {
    $stateProvider.state('product', {
        url: '/product/:id',
        templateUrl: 'js/product/templates/product.html',
        controller: 'ProductCtrl',
        resolve: {
            oneProduct: function oneProduct(productFactory, $stateParams) {
                return productFactory.getById($stateParams.id);
            }
        }
    });
});

app.controller('ProductsCtrl', function ($scope, $state, allProducts, productFactory) {

    $scope.products = allProducts;
});

app.controller('ProductCtrl', function ($scope, $state, oneProduct, productFactory, $stateParams) {

    $scope.product = oneProduct;

    // productFactory.getById($stateParams.id)
    // .then(function(product){
    // 	$scope.product = product
    // })
    // $state.go('playlist', {playlistId: playlist.id});

});

// $state.go('playlist', {playlistId: playlist.id});
app.config(function ($stateProvider) {
    $stateProvider.state('user', {
        url: '/users/:id',
        controller: 'SingleUserController',
        templateUrl: 'js/users/single.user.html'
    });
});

app.controller('SingleUserController', function ($scope, $log, UserFactory, $stateParams) {

    $scope.error = null;
    $scope.passwordConfirmed = null;
    $scope.oldPswd = null;
    $scope.edit;

    UserFactory.fetchOne($stateParams.id).then(function (user) {
        $scope.user = user;
    }).catch(function (err) {
        $scope.error = 'Unauthorized';
        console.error(err);
    });

    $scope.delete = function (id) {
        UserFactory.delete(id).then(function (users) {
            $scope.users = users;
        });
    };

    $scope.confirmPswd = function (oldPswd) {
        UserFactory.confirmPswd({ pswd: oldPswd }, $scope.user.id).then(function (confirmed) {
            $scope.passwordConfirmed = confirmed;
        }).catch($log.error);
    };

    $scope.save = function (id) {
        if ($scope.pswdCheck !== $scope.newPswd && $scope.newPswd) {
            return;
        }

        $scope.user.password = $scope.newPswd ? $scope.newPswd : $scope.oldPswd;
        UserFactory.update(id, $scope.user).then(function (user) {
            $scope.user = user;
            $scope.edit = null;
            $scope.passwordConfirmed = null;
            $scope.oldPswd = null;
        }).catch($log.error);
    };

    $scope.changeForm = function () {
        $scope.edit = true;
    };
});

app.factory('UserFactory', function ($http) {
    var UserObj = {};

    UserObj.fetchAll = function () {
        return $http.get('/api/users').then(function (response) {
            return response.data;
        });
    };

    UserObj.fetchOne = function (id) {
        return $http.get('/api/users/' + id).then(function (response) {
            return response.data;
        });
    };

    UserObj.delete = function (id) {
        return $http.delete('/api/users/' + id).then(function (response) {
            return UserObj.fetchAll();
        });
    };

    UserObj.update = function (id, userData) {
        return $http.put('/api/users/' + id, userData).then(function (response) {
            console.log(response);
            return response.data;
        });
    };

    UserObj.create = function (data) {
        return $http.post('/api/users', data).then(function (response) {
            return response.data;
        });
    };

    UserObj.confirmPswd = function (pswd, id) {
        return $http.put('/api/users/' + id + '/confirm', pswd).then(function (response) {
            return response.data;
        });
    };

    return UserObj;
});

app.config(function ($stateProvider) {
    $stateProvider.state('users', {
        url: '/users',
        controller: 'UsersController',
        templateUrl: 'js/users/users.html'
    });
});

app.controller('UsersController', function ($scope, $log, UserFactory, $state) {
    $scope.error = null;
    $scope.statuses = ['registered', 'admin'];

    UserFactory.fetchAll().then(function (users) {
        $scope.users = users;
    }).catch(function (err) {
        $scope.error = 'Unauthorized';
    });

    $scope.update = function (id, user) {
        if (id == $scope.users.id) {
            $state.reload();
            return;
        }
        UserFactory.update(id, user).then(function (user) {
            $state.reload();
        });
    };

    $scope.delete = function (id) {
        UserFactory.delete(id).then(function (users) {
            $scope.users = users;
        });
    };
});

app.factory('FullstackPics', function () {
    return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('RandomGreetings', function () {

    var getRandomFromArray = function getRandomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.', 'こんにちは、ユーザー様。', 'Welcome. To. WEBSITE.', ':D', 'Yes, I think we\'ve met before.', 'Gimme 3 mins... I just grabbed this really dope frittata', 'If Cooper could offer only one piece of advice, it would be to nevSQUIRREL!'];

    return {
        greetings: greetings,
        getRandomGreeting: function getRandomGreeting() {
            return getRandomFromArray(greetings);
        }
    };
});

app.directive('fullstackLogo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
    };
});
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function link(scope) {

            scope.items = [{ label: 'Home', state: 'home' }, { label: 'About', state: 'about' }, { label: 'Documentation', state: 'docs' }, { label: 'Members Only', state: 'membersOnly', auth: true }, { label: 'All Users', state: 'users', auth: true, admin: true }, { label: 'Politicians', state: 'products' }];

            scope.user = null;

            scope.isLoggedIn = function (item) {
                var adminNecessary = item.admin ? true : false;
                return adminNecessary ? AuthService.isAuthenticated() && scope.user.status === 'admin' : AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                });
            };

            var setUser = function setUser() {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function removeUser() {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };
});

app.directive('randoGreeting', function (RandomGreetings) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
        link: function link(scope) {
            scope.greeting = RandomGreetings.getRandomGreeting();
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiZG9jcy9kb2NzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luL3JlZ2lzdGVyLmpzIiwibG9naW4vcmVnaXN0ZXJGYWN0b3J5LmpzIiwibWVtYmVycy1vbmx5L21lbWJlcnMtb25seS5qcyIsInByb2R1Y3QvZGlyZWN0aXZlLmpzIiwicHJvZHVjdC9wcm9kdWN0ZmFjdG9yeS5qcyIsInByb2R1Y3QvcHJvZHVjdHMuanMiLCJ1c2Vycy9zaW5nbGUudXNlci5qcyIsInVzZXJzL3VzZXJzLmZhY3RvcnkuanMiLCJ1c2Vycy91c2Vycy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRnVsbHN0YWNrUGljcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvcmFuZG8tZ3JlZXRpbmcvcmFuZG8tZ3JlZXRpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQ0EsT0FBQSxHQUFBLEdBQUEsUUFBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLElBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBO0FBQ0E7QUFDQSxzQkFBQSxTQUFBLENBQUEsSUFBQTtBQUNBO0FBQ0EsdUJBQUEsU0FBQSxDQUFBLEdBQUE7QUFDQTtBQUNBLHVCQUFBLElBQUEsQ0FBQSxpQkFBQSxFQUFBLFlBQUE7QUFDQSxlQUFBLFFBQUEsQ0FBQSxNQUFBO0FBQ0EsS0FGQTtBQUdBLENBVEE7O0FBV0E7QUFDQSxJQUFBLEdBQUEsQ0FB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QUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLFdBREEsRUFFQSxVQUFBLFNBQUEsRUFBQTtBQUNBLG1CQUFBLFVBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUE7QUFDQSxTQUpBLENBQUE7QUFNQSxLQVBBOztBQVNBLFFBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxPQUFBLFNBQUEsSUFBQTtBQUNBLG9CQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxLQUFBLElBQUE7QUFDQSx1QkFBQSxVQUFBLENBQUEsWUFBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxJQUFBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsUUFBQSxJQUFBO0FBQ0EsU0FGQTs7QUFJQSxhQUFBLGVBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGdCQUFBLEtBQUEsZUFBQSxNQUFBLGVBQUEsSUFBQSxFQUFBO0FBQ0EsdUJBQUEsR0FBQSxJQUFBLENBQUEsUUFBQSxJQUFBLENBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQkFBQSxNQUFBLEdBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLGlCQUFBLEVBQUEsS0FBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxJQUFBO0FBQ0EsYUFGQSxDQUFBO0FBSUEsU0FyQkE7O0FBdUJBLGFBQUEsS0FBQSxHQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsbUJBQUEsTUFBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsRUFDQSxJQURBLENBQ0EsaUJBREEsRUFFQSxLQUZBLENBRUEsWUFBQTtBQUNBLHVCQUFBLEdBQUEsTUFBQSxDQUFBLEVB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QUFBLEVBQUEsSUFBQSxFQUFBLFdBQUEsRUFBQSxZQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLEdBQUEsSUFBQTtBQUNBLFdBQUEsaUJBQUEsR0FBQSxJQUFBO0FBQ0EsV0FBQSxPQUFBLEdBQUEsSUFBQTtBQUNBLFdBQUEsSUFBQTs7QUFFQSxnQkFBQSxRQUFBLENBQUEsYUFBQSxFQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLEtBSEEsRUFJQSxLQUpBLENBSUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsR0FBQSxjQUFBO0FBQ0EsZ0JBQUEsS0FBQSxDQUFBLEdBQUE7QUFDQSxLQVBBOztBQVNBLFdBQUEsTUFBQSxHQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0Esb0JBQUEsTUFBQSxDQUFBLEVBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLEdBQUEsS0FBQTtBQUNBLFNBSEE7QUFJQSxLQUxBOztBQU9BLFdBQUEsV0FBQSxHQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0Esb0JBQUEsV0FBQSxDQUFBLEVBQUEsTUFBQSxPQUFBLEVBQUEsRUFBQSxPQUFBLElBQUEsQ0FBQSxFQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsaUJBQUEsR0FBQSxTQUFBO0FBQ0EsU0FIQSxFQUlBLEtBSkEsQ0FJQSxLQUFBLEtBSkE7QUFLQSxLQU5BOztBQVFBLFdBQUEsSUFBQSxHQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxPQUFBLFNBQUEsS0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLE9BQUEsRUFBQTtBQUNBO0FBQ0E7O0FBRUEsZUFBQSxJQUFBLENBQUEsUUFBQSxHQUFBLE9BQUEsT0FBQSxHQUFBLE9BQUEsT0FBQSxHQUFBLE9BQUEsT0FBQTtBQUNBLG9CQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsT0FBQSxJQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxtQkFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLG1CQUFBLGlCQUFBLEdBQUEsSUFBQTtBQUNBLG1CQUFBLE9BQUEsR0FBQSxJQUFBO0FBQ0EsU0FOQSxFQU9BLEtBUEEsQ0FPQSxLQUFBLEtBUEE7QUFRQSxLQWRBOztBQWdCQSxXQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLEtBRkE7QUFHQSxDQWxEQTs7QUNUQSxJQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLFVBQUEsRUFBQTs7QUFFQSxZQUFBLFFBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxNQUFBLEdBQUEsQ0FBQSxZQUFBLEVBQ0EsSUFEQSxDQUNBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxJQUFBO0FBQ0EsU0FIQSxDQUFBO0FBSUEsS0FMQTs7QUFPQSxZQUFBLFFBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsTUFBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFNBQUEsSUFBQTtBQUNBLFNBSEEsQ0FBQTtBQUlBLEtBTEE7O0FBT0EsWUFBQSxNQUFBLEdBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsTUFBQSxDQUFBLGdCQUFBLEVBQUEsRUFDQSxJQURBLENBQ0EsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLFFBQUEsRUFBQTtBQUNBLFNBSEEsQ0FBQTtBQUlBLEtBTEE7O0FBT0EsWUFBQSxNQUFBLEdBQUEsVUFBQSxFQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxNQUFBLEdBQUEsQ0FBQSxnQkFBQSxFQUFBLEVBQUEsUUFBQSxFQUNBLElBREEsQ0FDQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG9CQUFBLEdBQUEsQ0FBQSxRQUFBO0FBQ0EsbUJBQUEsU0FBQSxJQUFBO0FBQ0Es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QUhBOztBQUtBLGtCQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsNEJBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsMkJBQUEsRUFBQSxDQUFBLE1BQUE7QUFDQSxpQkFGQTtBQUdBLGFBSkE7O0FBTUEsZ0JBQUEsVUFBQSxTQUFBLE9BQUEsR0FBQTtBQUNBLDRCQUFBLGVBQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSwwQkFBQSxJQUFBLEdBQUEsSUFBQTtBQUNBLGlCQUZBO0FBR0EsYUFKQTs7QUFNQSxnQkFBQSxhQUFBLFNBQUEsVUFBQSxHQUFBO0FBQ0Esc0JBQUEsSUFBQSxHQUFBLElBQUE7QUFDQSxhQUZBOztBQUlBOztBQUVBLHVCQUFBLEdBQUEsQ0FBQSxZQUFBLFlBQUEsRUFBQSxPQUFBO0FBQ0EsdUJBQUEsR0FBQSxDQUFBLFlBQUEsYUFBQSxFQUFBLFVBQUE7QUFDQSx1QkFBQSxHQUFBLENBQUEsWUFBQSxjQUFBLEVBQUEsVUFBQTtBQUVBOztBQTVDQSxLQUFBO0FBZ0RBLENBbERBOztBQ0FBLElBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLGVBQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0Esa0JBQUEsR0FEQTtBQUVBLHFCQUFBLHlEQUZBO0FBR0EsY0FBQSxjQUFBLEtBQUEsRUFBQTtBQUNBLGtCQUFBLFFBQUEsR0FBQSxnQkFBQSxpQkFBQSxFQUFBO0FBQ0E7QUFMQSxLQUFBO0FBUUEsQ0FWQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tHZW5lcmF0ZWRBcHAnLCBbJ2ZzYVByZUJ1aWx0JywgJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgLy8gVHJpZ2dlciBwYWdlIHJlZnJlc2ggd2hlbiBhY2Nlc3NpbmcgYW4gT0F1dGggcm91dGVcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL2F1dGgvOnByb3ZpZGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfSk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKClcbiAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgIGlmICh1c2VyKSAkcm9vdFNjb3BlLnVzZXIgPSB1c2VyO1xuICAgIH0pO1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWJvdXRDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hYm91dC9hYm91dC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Fib3V0Q29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEZ1bGxzdGFja1BpY3MpIHtcblxuICAgIC8vIEltYWdlcyBvZiBiZWF1dGlmdWwgRnVsbHN0YWNrIHBlb3BsZS5cbiAgICAkc2NvcGUuaW1hZ2VzID0gXy5zaHVmZmxlKEZ1bGxzdGFja1BpY3MpO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xuICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG9jcy9kb2NzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS9ob21lLmh0bWwnXG4gICAgfSk7XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUsICRyb290U2NvcGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbykudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgJHJvb3RTY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pO1xuXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3JlZ2lzdGVyJywge1xuXHRcdHVybDonL3JlZ2lzdGVyJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL3JlZ2lzdGVyLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG5cdH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1JlZ2lzdGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBSZWdpc3RlckZhY3RvcnksIEF1dGhTZXJ2aWNlKSB7XG5cbiAgICAkc2NvcGUuc2VuZFJlZ2lzdGVyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgUmVnaXN0ZXJGYWN0b3J5LmNyZWF0ZSgkc2NvcGUucmVnaXN0ZXIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsZXQgb2JqID0ge2VtYWlsOiAkc2NvcGUucmVnaXN0ZXIuZW1haWwsIHBhc3N3b3JkOiAkc2NvcGUucmVnaXN0ZXIucGFzc3dvcmR9XG5cbiAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKG9iaikudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdFbWFpbCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQhJ1xuICAgICAgICAgICAgJHNjb3BlLnJlZ2lzdGVyLmVtYWlsID0gJydcbiAgICAgICAgICAgICRzY29wZS5yZWdpc3Rlci5wYXNzd29yZCA9ICcnXG4gICAgICAgIH0pXG4gICAgfVxuXG59KVxuIiwiYXBwLmZhY3RvcnkoJ1JlZ2lzdGVyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0dmFyIHJlZ2lzdGVyID0ge31cblxuXHRyZWdpc3Rlci5jcmVhdGUgPSBmdW5jdGlvbihkYXRhKXtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2VycycsIGRhdGEpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHVzZXIpe1xuXHRcdFx0cmV0dXJuIHVzZXIuZGF0YVxuXHRcdH0pXG5cdH1cblx0cmV0dXJuIHJlZ2lzdGVyXG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtZW1iZXJzT25seScsIHtcbiAgICAgICAgdXJsOiAnL21lbWJlcnMtYXJlYScsXG4gICAgICAgIHRlbXBsYXRlOiAnPGltZyBuZy1yZXBlYXQ9XCJpdGVtIGluIHN0YXNoXCIgd2lkdGg9XCIzMDBcIiBuZy1zcmM9XCJ7eyBpdGVtIH19XCIgLz4nLFxuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoJHNjb3BlLCBTZWNyZXRTdGFzaCkge1xuICAgICAgICAgICAgU2VjcmV0U3Rhc2guZ2V0U3Rhc2goKS50aGVuKGZ1bmN0aW9uIChzdGFzaCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5zdGFzaCA9IHN0YXNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGF0YS5hdXRoZW50aWNhdGUgaXMgcmVhZCBieSBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgICAvLyB0aGF0IGNvbnRyb2xzIGFjY2VzcyB0byB0aGlzIHN0YXRlLiBSZWZlciB0byBhcHAuanMuXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnU2VjcmV0U3Rhc2gnLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHZhciBnZXRTdGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9tZW1iZXJzL3NlY3JldC1zdGFzaCcpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFN0YXNoOiBnZXRTdGFzaFxuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ3Rlc3RQcm9kdWN0cycsIGZ1bmN0aW9uKHByb2R1Y3RGYWN0b3J5LCAkc3RhdGUpe1xuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OidFJyxcblx0XHRzY29wZToge1xuXHRcdFx0cHJvZHVjdHM6ICc9J1xuXHRcdH0sXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9wcm9kdWN0L2luZGV4Lmh0bWwnLFxuXHRcdGxpbms6IGZ1bmN0aW9uKHNjb3BlKXtcblx0XHRcdHNjb3BlLmRlbGV0ZXIgPSBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdFx0cHJvZHVjdEZhY3RvcnkuZGVsZXRlQnlJZChpZClcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzKXtcblx0XHRcdFx0XHQkc3RhdGUucmVsb2FkKClcblx0XHRcdFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pXG5cbi8vIGFwcC5kaXJlY3RpdmUoJ3NpbmdsZVByb2R1Y3QnLCBmdW5jdGlvbihwcm9kdWN0RmFjdG9yeSwgJHN0YXRlKXtcbi8vIFx0cmV0dXJuIHtcbi8vIFx0XHRyZXN0cmljdDonRScsXG4vLyBcdFx0c2NvcGU6IHtcbi8vIFx0XHRcdHByb2R1Y3RzOiAnPSdcbi8vIFx0XHR9LFxuLy8gXHRcdHRlbXBsYXRlVXJsOiAnanMvcHJvZHVjdC90ZW1wbGF0ZXMvcHJvZHVjdC5odG1sJ1xuLy8gXHR9XG4vLyB9KSIsImFwcC5mYWN0b3J5KCdwcm9kdWN0RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKXtcblx0dmFyIHByb2R1Y3QgPSB7fVxuXHRcblx0cHJvZHVjdC5nZXRBbGwgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvcHJvZHVjdHMnKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhXG5cdFx0fSlcblx0fVxuXHRwcm9kdWN0LmRlbGV0ZUJ5SWQgPSBmdW5jdGlvbihpZCl7XG5cdFx0cmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9wcm9kdWN0cy8nICsgaWQpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhXG5cdFx0XHR9KVxuXHR9XG5cdHByb2R1Y3QuZ2V0QnlJZCA9IGZ1bmN0aW9uKGlkKXtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3Byb2R1Y3RzLycgKyBpZClcblx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YVxuXHRcdH0pXG5cdH1cblxuXHRyZXR1cm4gcHJvZHVjdFxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Byb2R1Y3RzJywge1xuXHRcdHVybDonL3Byb2R1Y3RzJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL3Byb2R1Y3QvdGVtcGxhdGVzL3Byb2R1Y3RzLmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdQcm9kdWN0c0N0cmwnLFxuXHRcdHJlc29sdmU6IHtcblx0XHRcdGFsbFByb2R1Y3RzOiBmdW5jdGlvbihwcm9kdWN0RmFjdG9yeSl7XG5cdFx0XHRcdHJldHVybiBwcm9kdWN0RmFjdG9yeS5nZXRBbGwoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpe1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJvZHVjdCcsIHtcblx0XHR1cmw6Jy9wcm9kdWN0LzppZCcsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9wcm9kdWN0L3RlbXBsYXRlcy9wcm9kdWN0Lmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdQcm9kdWN0Q3RybCcsXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0b25lUHJvZHVjdDogZnVuY3Rpb24ocHJvZHVjdEZhY3RvcnksICRzdGF0ZVBhcmFtcyl7XG5cdFx0XHRcdHJldHVybiBwcm9kdWN0RmFjdG9yeS5nZXRCeUlkKCRzdGF0ZVBhcmFtcy5pZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG5cblxuYXBwLmNvbnRyb2xsZXIoJ1Byb2R1Y3RzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBhbGxQcm9kdWN0cywgcHJvZHVjdEZhY3RvcnkpIHtcblxuXHQkc2NvcGUucHJvZHVjdHMgPSBhbGxQcm9kdWN0cztcblx0IFxuXG5cblx0XHRcblx0XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignUHJvZHVjdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgb25lUHJvZHVjdCwgcHJvZHVjdEZhY3RvcnksICRzdGF0ZVBhcmFtcykge1xuXG5cdCRzY29wZS5wcm9kdWN0ID0gb25lUHJvZHVjdDtcblx0XG5cdFxuXHQvLyBwcm9kdWN0RmFjdG9yeS5nZXRCeUlkKCRzdGF0ZVBhcmFtcy5pZClcblx0Ly8gLnRoZW4oZnVuY3Rpb24ocHJvZHVjdCl7XG5cdC8vIFx0JHNjb3BlLnByb2R1Y3QgPSBwcm9kdWN0XG5cdC8vIH0pXG5cdC8vICRzdGF0ZS5nbygncGxheWxpc3QnLCB7cGxheWxpc3RJZDogcGxheWxpc3QuaWR9KTtcblxuXHRcdFxuXHRcbn0pO1xuXG5cblxuXG4vLyAkc3RhdGUuZ28oJ3BsYXlsaXN0Jywge3BsYXlsaXN0SWQ6IHBsYXlsaXN0LmlkfSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndXNlcicsIHtcbiAgICB1cmw6ICcvdXNlcnMvOmlkJyxcbiAgICBjb250cm9sbGVyOiAnU2luZ2xlVXNlckNvbnRyb2xsZXInLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvdXNlcnMvc2luZ2xlLnVzZXIuaHRtbCdcbiAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignU2luZ2xlVXNlckNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRsb2csIFVzZXJGYWN0b3J5LCAkc3RhdGVQYXJhbXMpIHtcblxuICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAkc2NvcGUucGFzc3dvcmRDb25maXJtZWQgPSBudWxsO1xuICAkc2NvcGUub2xkUHN3ZCA9IG51bGw7XG4gICRzY29wZS5lZGl0XG5cbiAgIFVzZXJGYWN0b3J5LmZldGNoT25lKCRzdGF0ZVBhcmFtcy5pZClcbiAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICRzY29wZS51c2VyID0gdXNlcjtcbiAgfSlcbiAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAkc2NvcGUuZXJyb3IgPSAnVW5hdXRob3JpemVkJ1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICB9KTtcblxuICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24oaWQpIHtcbiAgICBVc2VyRmFjdG9yeS5kZWxldGUoaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24odXNlcnMpIHtcbiAgICAgICRzY29wZS51c2VycyA9IHVzZXJzO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmNvbmZpcm1Qc3dkID0gZnVuY3Rpb24gKG9sZFBzd2Qpe1xuICAgIFVzZXJGYWN0b3J5LmNvbmZpcm1Qc3dkKHtwc3dkOiBvbGRQc3dkfSwgJHNjb3BlLnVzZXIuaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24gKGNvbmZpcm1lZCl7XG4gICAgICAkc2NvcGUucGFzc3dvcmRDb25maXJtZWQgPSBjb25maXJtZWQ7XG4gICAgfSlcbiAgICAuY2F0Y2goJGxvZy5lcnJvcilcbiAgfVxuXG4gICRzY29wZS5zYXZlID0gZnVuY3Rpb24gKGlkKXtcbiAgICBpZiAoJHNjb3BlLnBzd2RDaGVjayAhPT0gJHNjb3BlLm5ld1Bzd2QgJiYgJHNjb3BlLm5ld1Bzd2Qpe1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgJHNjb3BlLnVzZXIucGFzc3dvcmQgPSAkc2NvcGUubmV3UHN3ZCA/ICRzY29wZS5uZXdQc3dkIDogJHNjb3BlLm9sZFBzd2Q7XG4gICAgVXNlckZhY3RvcnkudXBkYXRlKGlkLCAkc2NvcGUudXNlcilcbiAgICAudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICRzY29wZS51c2VyID0gdXNlclxuICAgICAgJHNjb3BlLmVkaXQgPSBudWxsO1xuICAgICAgJHNjb3BlLnBhc3N3b3JkQ29uZmlybWVkID0gbnVsbDtcbiAgICAgICRzY29wZS5vbGRQc3dkID0gbnVsbDtcbiAgICB9KVxuICAgIC5jYXRjaCgkbG9nLmVycm9yKVxuICB9XG5cbiAgJHNjb3BlLmNoYW5nZUZvcm0gPSBmdW5jdGlvbiAoKXtcbiAgICAkc2NvcGUuZWRpdCA9IHRydWU7XG4gIH1cbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApIHtcbiAgdmFyIFVzZXJPYmogPSB7fTtcblxuICBVc2VyT2JqLmZldGNoQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2VycycpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgVXNlck9iai5mZXRjaE9uZSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2Vycy8nICsgaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgVXNlck9iai5kZWxldGUgPSBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvdXNlcnMvJyArIGlkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gVXNlck9iai5mZXRjaEFsbCgpO1xuICAgIH0pXG4gIH1cblxuICBVc2VyT2JqLnVwZGF0ZSA9IGZ1bmN0aW9uKGlkLCB1c2VyRGF0YSkge1xuICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvdXNlcnMvJyArIGlkLCB1c2VyRGF0YSlcbiAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgfSk7XG4gIH1cblxuICBVc2VyT2JqLmNyZWF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2VycycsIGRhdGEpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIH0pO1xuICB9XG5cbiAgVXNlck9iai5jb25maXJtUHN3ZCA9IGZ1bmN0aW9uIChwc3dkLCBpZCl7XG4gICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS91c2Vycy8nICsgaWQgKyAnL2NvbmZpcm0nLCBwc3dkKVxuICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gVXNlck9iajtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndXNlcnMnLCB7XG4gICAgdXJsOiAnL3VzZXJzJyxcbiAgICBjb250cm9sbGVyOiAnVXNlcnNDb250cm9sbGVyJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3VzZXJzL3VzZXJzLmh0bWwnXG4gIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1VzZXJzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuICAkc2NvcGUuZXJyb3IgPSBudWxsXG4gICRzY29wZS5zdGF0dXNlcyA9IFsncmVnaXN0ZXJlZCcsICdhZG1pbiddO1xuXG4gICBVc2VyRmFjdG9yeS5mZXRjaEFsbCgpXG4gIC50aGVuKGZ1bmN0aW9uKHVzZXJzKSB7XG4gICAgJHNjb3BlLnVzZXJzID0gdXNlcnM7XG4gIH0pXG4gIC5jYXRjaChmdW5jdGlvbiAoZXJyKXtcbiAgICAkc2NvcGUuZXJyb3IgPSAnVW5hdXRob3JpemVkJ1xuICB9KTtcblxuICAkc2NvcGUudXBkYXRlID0gZnVuY3Rpb24oaWQsIHVzZXIpIHtcbiAgICBpZiAoaWQgPT0gJHNjb3BlLnVzZXJzLmlkKSB7XG4gICAgICAkc3RhdGUucmVsb2FkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFVzZXJGYWN0b3J5LnVwZGF0ZShpZCwgdXNlcilcbiAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAkc3RhdGUucmVsb2FkKCk7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24oaWQpIHtcbiAgICBVc2VyRmFjdG9yeS5kZWxldGUoaWQpXG4gICAgLnRoZW4oZnVuY3Rpb24odXNlcnMpIHtcbiAgICAgICRzY29wZS51c2VycyA9IHVzZXJzO1xuICAgIH0pO1xuICB9XG5cbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ0Z1bGxzdGFja1BpY3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CN2dCWHVsQ0FBQVhRY0UuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vZmJjZG4tc3Bob3Rvcy1jLWEuYWthbWFpaGQubmV0L2hwaG90b3MtYWsteGFwMS90MzEuMC04LzEwODYyNDUxXzEwMjA1NjIyOTkwMzU5MjQxXzgwMjcxNjg4NDMzMTI4NDExMzdfby5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItTEtVc2hJZ0FFeTlTSy5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3OS1YN29DTUFBa3c3eS5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItVWo5Q09JSUFJRkFoMC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I2eUl5RmlDRUFBcWwxMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFLVQ3NWxXQUFBbXFxSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFdlpBZy1WQUFBazkzMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFZ05NZU9YSUFJZkRoSy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFUXlJRE5XZ0FBdTYwQi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NDRjNUNVFXOEFFMmxHSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBZVZ3NVNXb0FBQUxzai5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBYUpJUDdVa0FBbElHcy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBUU93OWxXRUFBWTlGbC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItT1FiVnJDTUFBTndJTS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I5Yl9lcndDWUFBd1JjSi5wbmc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I1UFRkdm5DY0FFQWw0eC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I0cXdDMGlDWUFBbFBHaC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0IyYjMzdlJJVUFBOW8xRC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0J3cEl3cjFJVUFBdk8yXy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0JzU3NlQU5DWUFFT2hMdy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NKNHZMZnVVd0FBZGE0TC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJN3d6akVWRUFBT1BwUy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJZEh2VDJVc0FBbm5IVi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NHQ2lQX1lXWUFBbzc1Vi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NJUzRKUElXSUFJMzdxdS5qcGc6bGFyZ2UnXG4gICAgXTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1JhbmRvbUdyZWV0aW5ncycsIGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBnZXRSYW5kb21Gcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgIHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldO1xuICAgIH07XG5cbiAgICB2YXIgZ3JlZXRpbmdzID0gW1xuICAgICAgICAnSGVsbG8sIHdvcmxkIScsXG4gICAgICAgICdBdCBsb25nIGxhc3QsIEkgbGl2ZSEnLFxuICAgICAgICAnSGVsbG8sIHNpbXBsZSBodW1hbi4nLFxuICAgICAgICAnV2hhdCBhIGJlYXV0aWZ1bCBkYXkhJyxcbiAgICAgICAgJ0lcXCdtIGxpa2UgYW55IG90aGVyIHByb2plY3QsIGV4Y2VwdCB0aGF0IEkgYW0geW91cnMuIDopJyxcbiAgICAgICAgJ1RoaXMgZW1wdHkgc3RyaW5nIGlzIGZvciBMaW5kc2F5IExldmluZS4nLFxuICAgICAgICAn44GT44KT44Gr44Gh44Gv44CB44Om44O844K244O85qeY44CCJyxcbiAgICAgICAgJ1dlbGNvbWUuIFRvLiBXRUJTSVRFLicsXG4gICAgICAgICc6RCcsXG4gICAgICAgICdZZXMsIEkgdGhpbmsgd2VcXCd2ZSBtZXQgYmVmb3JlLicsXG4gICAgICAgICdHaW1tZSAzIG1pbnMuLi4gSSBqdXN0IGdyYWJiZWQgdGhpcyByZWFsbHkgZG9wZSBmcml0dGF0YScsXG4gICAgICAgICdJZiBDb29wZXIgY291bGQgb2ZmZXIgb25seSBvbmUgcGllY2Ugb2YgYWR2aWNlLCBpdCB3b3VsZCBiZSB0byBuZXZTUVVJUlJFTCEnLFxuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21Gcm9tQXJyYXkoZ3JlZXRpbmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pO1xuIiwiYXBwLmRpcmVjdGl2ZSgnZnVsbHN0YWNrTG9nbycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmh0bWwnXG4gICAgfTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSG9tZScsIHN0YXRlOiAnaG9tZScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWJvdXQnLCBzdGF0ZTogJ2Fib3V0JyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdEb2N1bWVudGF0aW9uJywgc3RhdGU6ICdkb2NzJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdNZW1iZXJzIE9ubHknLCBzdGF0ZTogJ21lbWJlcnNPbmx5JywgYXV0aDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBbGwgVXNlcnMnLCBzdGF0ZTogJ3VzZXJzJywgYXV0aDogdHJ1ZSwgYWRtaW46IHRydWV9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdQb2xpdGljaWFucycsIHN0YXRlOidwcm9kdWN0cyd9LFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIHZhciBhZG1pbk5lY2Vzc2FyeSA9IGl0ZW0uYWRtaW4gPyB0cnVlIDogZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRtaW5OZWNlc3NhcnkgPyBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBzY29wZS51c2VyLnN0YXR1cyA9PT0gJ2FkbWluJyA6IEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdyYW5kb0dyZWV0aW5nJywgZnVuY3Rpb24gKFJhbmRvbUdyZWV0aW5ncykge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS5ncmVldGluZyA9IFJhbmRvbUdyZWV0aW5ncy5nZXRSYW5kb21HcmVldGluZygpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
