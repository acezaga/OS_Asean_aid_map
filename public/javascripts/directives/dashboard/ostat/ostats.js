'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('sbAdminApp')
    .directive('ostats',function() {
        return {
            templateUrl:'javascripts/directives/dashboard/ostat/ostats.html',
            restrict:'E',
            replace:true,
            scope: {
                'model': '=',
                'resname': '@',
                'number': '@',
                'name': '@',
                'colour': '@',
                'details':'@',
                'type':'=',
                'resdetails':'@',
                'width':'@',
                'goto':'@',
                'dynamicresource':'@'
            }

        }
    });
