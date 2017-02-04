'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('sbAdminApp')
	.directive('headerNotification',function(){
		return {
        templateUrl:'javascripts/directives/header/header-notification/header-notification.html',
        restrict: 'E',
        replace: true,
		link: function($scope){
				$scope.tags = [
					//{ text: 'Tag1' },
					//{ text: 'Tag2' }
				];
				$scope.loadTags = function(query) {
					return $http.get('/tags?query=' + query);
				};

				$scope.addRecipient = function(text) {
					var obj = {
						text: text
					};
					$scope.tags.push(obj);
				};
			}
    	}
	});


