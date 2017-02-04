/**
 * Created by Asus on 1/27/2017.
 */
angular.module('sbAdminApp').controller('FAQController', function($scope, $rootScope, $http, $location, toaster, $timeout){
    $scope.faqQuestion = {};
    $scope.listOfFAQs = [];

    accountService.getListOfFAQs().then(function(response){
       if(response.data.status){
           $scope.listOfFAQs = response.data.faqs;
       }
    });

    $scope.submitQuestion = function(){
        accountService.sendFAQ($scope.faqQuestion).then(function(response){
            if(response.data.status){
                toaster.pop('success', 'Question sent', 'Question was successfully sent to the developers');
            }
        });
    }
});