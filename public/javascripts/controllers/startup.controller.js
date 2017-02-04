/**
 * Created by Asus on 11/21/2016.
 */

angular.module('sbAdminApp').controller('startupController', function($scope, $rootScope, Authentication){
    $rootScope.PageTitle = "Asean Aid Map";
    //console.log("refreshed authentication");
    Authentication.refreshAuthentication();

    //$scope.credentials = Authentication.getLoginCredentials();
    //
    //if($scope.credentials){
    //
    //    console.log("credentials: "+$scope.credentials);
    //
    //    accountService.authenticateAccount($scope.credentials).then(function(response){
    //        if(response.data.status){
    //            Authentication.setCredentials(response.data.account);
    //            socketService.emit('LoginUser', $rootScope.account);
    //        }
    //        else{
    //            Authentication.removeCredentials();
    //        }
    //    });
    //}

});