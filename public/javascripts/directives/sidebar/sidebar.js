'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('sbAdminApp')
  .directive('sidebar',function() {
    return {
      templateUrl:'javascripts/directives/sidebar/sidebar.html',
      restrict: 'E',
      replace: true,
    }
  });
