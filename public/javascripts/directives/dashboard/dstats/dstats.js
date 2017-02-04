'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('sbAdminApp')
    .directive('dstats',function() {
        return {
            templateUrl:'javascripts/directives/dashboard/dstats/dstats.html',
            restrict:'E',
            replace:true,
            scope: {
                'model': '=',
                'resname': '@',
                'number': '@',
                'name': '@',
                'colour': '@',
                'details':'@',
                'type':'@',
                'resdetails':'@',
                'width':'@',
                'goto':'@',
                'needed': '=',
                'available': '=',
                'donation': '='
            }

        }
    });
