'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('sbAdminApp')
	.directive('header',function(){
		return {
        templateUrl:'javascripts/directives/header/header.html',
        restrict: 'E',
        replace: true,
    	}
	});

angular.module('sbAdminApp')
	.directive('header2',function(){
		return {
			templateUrl:'javascripts/directives/header/header2.html',
			restrict: 'E',
			replace: true,
		}
	});
