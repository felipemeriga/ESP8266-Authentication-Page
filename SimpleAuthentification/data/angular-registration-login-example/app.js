(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngCookies'])
        .config(config)
        .run(run);

    config.$inject = ['$routeProvider', '$locationProvider'];
    function config($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                controller: 'HomeController',
                templateUrl: 'home/home.view.html',
                controllerAs: 'vm'
            })

            .when('/login', {
                controller: 'LoginController',
                templateUrl: 'login/login.view.html',
                controllerAs: 'vm'
            })

            .when('/register', {
                controller: 'RegisterController',
                templateUrl: 'register/register.view.html',
                controllerAs: 'vm'
            })

            .otherwise({ redirectTo: '/login' });
			
			
    }

    run.$inject = ['$rootScope', '$location', '$cookies', '$http','UserService'];
    function run($rootScope, $location, $cookies, $http, UserService) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookies.getObject('globals') || {};
		$rootScope.wifiSettingsGlobals = $cookies.getObject('wifiSettings') || {};
		$rootScope.connectedWifi = false;
		
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
        }
		
		UserService.getConnectionStatus().then(function (response) {
			if(response.status == 200){
				if(response.data == true){
					$rootScope.connectedWifi = true;
				}
				else{
					$rootScope.connectedWifi = false;
				}
			}
		});
		
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
			if(!$rootScope.connectedWifi){
				if($rootScope.wifiSettingsGlobals.ssid){
					UserService.passWifiCredentialsConnect($rootScope.wifiSettingsGlobals).then(function (response) {
						if(response.status == 200 || response.status == 204){
							console.log('Connected Successfully with' + $rootScope.wifiSettingsGlobals.ssid );
							$location.path('/home');
							$rootScope.connectedWifi = true;
						}
						else{
							$cookies.remove('wifiSettings');
							$location.path('/login');
						}
					});
				}
				else{
					$location.path('/login');
				}
				
			}
        });
    }

})();