/**
 * Created by Asus on 11/4/2016.
 */

angular.module('sbAdminApp').controller('createAcctController', function($scope, $http, $state, $rootScope, accountService, socketService, Authentication, toaster, $timeout, $location){
    //Authentication.authenticate();
    $scope.status = "";
    $scope.newUser = {username: '', password: '', orgname: '', confirmPassword: '', email: '', country: '', description: ''};

    $scope.postNewAccount = function(){

        accountService.createAccount($scope.newUser).then(function(response){
            if(response.data.status) {
                //$rootScope.account = response.data.account;
                Authentication.setCredentials(response.data.account);
                //$rootScope.authentication = true;
                $scope.status = response.statusText;
                socketService.emit('LoginUser', $rootScope.account);
                toaster.pop('success', "Registration Successful", "Successfully Created an Account!");
                $timeout(function(){
                    $state.go('dashboard.home')
                }, 2000);
            }
            else{
                toaster.pop('error', "Warning   ", response.data.message);
                //$scope.status = response.data.message;
            }
        }, function(err){
            $scope.status = err.statusText;
        });
    }
});

angular.module('sbAdminApp').controller('signInController', function($scope, $rootScope, $state, accountService, socketService, Authentication, toaster){
    //Authentication.authenticate();
    $scope.user = {username: '', password: ''};
    $scope.messageRes = "";

    $scope.login = function () {
        accountService.authenticateAccount($scope.user).then(function (response) {
            if (response.data.status) {
                $scope.failedLogin = false;
                //$rootScope.account = response.data.account;
                //$rootScope.authentication = true;
                Authentication.setLoginCredentials($scope.user);
                Authentication.setCredentials(response.data.account);
                socketService.emit('LoginUser', $rootScope.account);
                $rootScope.$emit('CheckSuggestion', {});
                $state.go('dashboard.home');
            }
            else {
                $scope.failedLogin = true;
                $scope.messageRes = response.data.message;
            }
        }, function (err) {
            //$scope.failedLogin = true;
            //$scope.messageRes = err.data.message;
        });
    }
});

angular.module('sbAdminApp').controller('editProfileController', function($scope, $rootScope, $state, accountService, fieldService, Authentication, toaster, $timeout, $location){
    Authentication.authentication();

    $scope.userDetails = $rootScope.account;

    $scope.resourcesTypes = fieldService.resourcesTypes;

    $scope.sectorTypes = fieldService.sectorTypes;

    $scope.profilePicture = $scope.userDetails.picture;

    $scope.resourceSet = {
        resource: $scope.userDetails.resources
    };

    $scope.sectorSet = {
        sectors: []
    };

    for(i = 0; i < $scope.userDetails.sectors.length; i++){
        $scope.sectorSet.sectors.push({type: $scope.userDetails.sectors[i].type});
    }

    $scope.awardSet = {
        awards: []
    };

    for(i = 0; i < $scope.userDetails.awards.length; i++){
        $scope.awardSet.awards.push({type: $scope.userDetails.awards[i]});
    }

    $scope.addNewField = function(type){
        fieldService.addNewItemAccount($scope, type);
    };

    $scope.removeField = function(index, type){
        fieldService.removeItem($scope, type, index);
    };

    $scope.activateField = function(resourceType, fieldName){
        return fieldService.activateField(resourceType, fieldName);
    };

    $scope.getDescriptionRes = function(resource){
        return fieldService.getDescriptionRes(resource);
    };

    $scope.saveUpdates = function(){
        $scope.userDetails.sectors = [];
        $scope.userDetails.awards = [];
        $scope.userDetails.id = $rootScope.account._id;
        $scope.userDetails.resources = $scope.resourceSet.resource;

        if($scope.profilePicture.base64) {
            $scope.userDetails.picture = $scope.profilePicture.base64;
        }
        else{
            $scope.userDetails.picture = $scope.profilePicture;
        }

        for(i = 0; i < $scope.sectorSet.sectors.length; i++){
            $scope.userDetails.sectors.push({type: $scope.sectorSet.sectors[i].type});
        }

        for(i = 0; i < $scope.awardSet.awards.length; i++){
            $scope.userDetails.awards.push($scope.awardSet.awards[i].type);
        }

        accountService.saveChanges($scope.userDetails).then(function(response){
            if(response.data.status){
                $rootScope.account = response.data.account;
                Authentication.setCredentials(response.data.account);
                toaster.pop('success', "Updates Applied", "Changes to Organization Profile was successfully saved!");
                $timeout(function(){
                    //$state.go('dashboard.home')
                    $rootScope.selectedAccount = response.data.account;
                    $location.url('/dashboard/orgprofile?name='+response.data.account.username);
                }, 2000);
                //$rootScope.$emit('editAccountSuccess',{});
            }
            else{
                $scope.errorMessage = response.data.message;
            }
        });
    }

    $scope.returnHome = function(){
        $state.go('dashboard.home');
    }

    $scope.submit = function() {
        return false;
    };
});

angular.module('sbAdminApp').controller('accountSettingsController', function($scope, $rootScope, $state, accountService, fieldService, Authentication, toaster, $timeout){
    Authentication.authentication();

    $scope.accountSettings = {};
    $scope.accountSettings.id = $rootScope.account._id;
    $scope.accountSettings.email = $rootScope.account.contacts.email;
    $scope.accountSettings.username = $rootScope.account.username;

    $scope.updateOnPassword = function(){
        $('#changePass').modal('toggle');
    }

    $scope.submitChanges = function(){
        if(!$scope.accountSettings.oldPassword){
            return toaster.pop('error', 'Old Password Required!', 'Old Password field was left empty.');
        }

        if($scope.accountSettings.newPassword == $scope.accountSettings.confirmNewPassword){
            accountService.changeAccountSettings($scope.accountSettings).then(function(response){
                if(response.data.status){
                    Authentication.setCredentials(response.data.account);
                    toaster.pop('success', 'Update Successful', 'Account Settings was successfully updated');
                    $timeout(function(){
                        $state.go('dashboard.home')
                    }, 2000);
                }
                else{
                    toaster.pop('error', 'Update Failed', response.data.message);
                }
            });
        }
        else{
            toaster.pop('error', 'Password mismatch!', 'New Password and Confirm New Password have mismatched values');
        }
    }
});

