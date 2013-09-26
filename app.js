angular.module('MonitorScore', []).

	factory('socket', function ($rootScope) {
		var socket = io.connect();

		return {
			on: function (eventName, callback) {
				socket.on(eventName, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						callback.apply(socket, args);
					});
				});
			},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			}
		};
	}).

	directive('ngTap', function () {
		return function (scope, element, attrs) {
			element.bind('touchstart', function () {
				scope.$apply(attrs.ngTap);
			});

			element.bind('click' ,function (e) {
				e.preventDefault();
			});
		};
	}).

	directive('resize', function ($window) {
		return function (scope, element, attrs) {
			angular.element($window).bind('resize', function () {
				scope.$apply(attrs.resize);
			});
		};
	}).

	directive('contenteditable', function () {
		return {
			require: 'ngModel',
			link: function (scope, elements, attrs, ctrl) {
				elements.bind('blur', function () {
					scope.$apply(function () {
						ctrl.$setViewValue(elements.html());
					});
				});

				ctrl.$render = function () {
					elements.html(ctrl.$viewValue);
				};
			}
		};
	}).

	controller('AppCtrl', function ($scope, $window, socket) {
		$scope.mode = 'ontouchstart' in document ? 'admin' : 'display';

		$scope.players = {};
		$scope.noPlayers = true;

		$scope.$watch('players', function (players) {
			$scope.noPlayers = Object.keys(players).length === 0;
		}, true);

		$scope.updateFontSize = function () {
			$scope.style = {fontSize: $window.innerHeight / 2 + 'px'};
		};

		$scope.updateFontSize();

		$scope.increasePoint = function (player) {
			++player.score;
			socket.emit('player:change', $scope.players);
		};

		$scope.decreasePoint = function (player) {
			--player.score;
			socket.emit('player:change', $scope.players);
		};

		$scope.update = function () {
			socket.emit('player:change', $scope.players);
		};

		socket.on('connect', function () {
			socket.emit('init', $scope.mode === 'display');
		});

		socket.on('init', function (data) {
			$scope.id = data.id;
			$scope.players = data.players;

		});

		socket.on('player:change', function (players) {
			if (!angular.equals(players, $scope.players))
				$scope.players = players;
		});

	});
