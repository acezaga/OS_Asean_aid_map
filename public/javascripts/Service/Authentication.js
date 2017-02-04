/**
 * Created by Asus on 12/2/2016.
 */
angular.module('sbAdminApp').factory('Authentication', function($cookies, $rootScope, accountService, socketService, localStorageService){
    var account = {};

    account.setLoginCredentials = function(account){
        var credentials = {
            username: account.username,
            password: account.password
        };

        $cookies.putObject('credential', credentials);
    };

    account.getLoginCredentials = function(){
        return $cookies.getObject('credential');
    };

    account.setCredentials = function(account){
        localStorageService.set('orgPicture', account.picture);
        delete account.picture;
        //$cookies.remove('user');
        $cookies.putObject('user', account);
        $rootScope.account = account;
        $rootScope.authentication = true;
    };

    account.removeCredentials = function(){
        $cookies.remove('user');
        localStorageService.remove('orgPicture');
        $cookies.remove('credential');
        $rootScope.account = null;
        $rootScope.authentication = false;
    };

    account.authentication = function(){
        if($cookies.getObject('user')){
            $rootScope.account = $cookies.getObject('user');
            $rootScope.account.picture = localStorageService.get('orgPicture');
            $rootScope.authentication = true;
        }
        else{
            $rootScope.authentication = false;
        }
    };

    account.refreshAuthentication = function(){
        var credentials = account.getLoginCredentials();

        if(credentials){
            console.log("credentials: "+credentials);

            accountService.authenticateAccount(credentials).then(function(response){
                if(response.data.status){
                    account.setCredentials(response.data.account);
                    socketService.emit('LoginUser', $rootScope.account);
                    console.log('authentication refreshed: '+JSON.stringify(response.data.account));
                }
                else{
                    account.removeCredentials();
                }
            });
        }
    };

    return account;
});

