/**
 * Created by Asus on 1/7/2017.
 */
angular.module('sbAdminApp').controller('messageProfileController', function($rootScope, $scope, $location, socketService, accountService, projectService, Authentication){
    Authentication.authentication();

    $scope.currentContact = {};
    $scope.message = {};
    $scope.messages = [];

    socketService.on('new-message', function(data){
        if(data.message.type == 'private') {
            if (data.message.from.id == $scope.currentContact._id) {
                $scope.messages.push(data.message);
            }
        }
        else{
            if(data.message.to.id == $scope.currentContact._id){
                $scope.messages.push(data.message);
            }
        }
    });

    $scope.retrieveContacts = function(){
        accountService.getConnectionInfo($rootScope.account.connections).then(function(response){
            //console.log('response: '+response.data);
            $scope.connectedAccounts = response.data;
        });

        projectService.getCollaboratedProjects($rootScope.account._id).then(function(response){
            if(response.data.status) {
                console.log('response: '+JSON.stringify(response.data.projects));
                $scope.collaboratedProjects = response.data.projects;

                $scope.collaboratedProjects.forEach(function(project){
                    socketService.emit('join-room', project._id);
                });
            }
        });
    }

    $scope.getHistoryOfMessages = function(recipient){
        var object = {};
        object.from = $rootScope.account._id;
        object.to = recipient._id;

        if(recipient.type == 'private') {
            socketService.emit('chat-history', object, function (data) {
                if(data.status) {
                    //add the messages to the chat box
                    $scope.messages = data.messages;
                    $scope.message.subject = $scope.messages[0].subject;
                }
            });
        }
        else{
            socketService.emit('chat-history-group', object, function (data) {
                if(data.status) {
                    //add the messages to the chat box
                    $scope.messages = data.messages;
                    $scope.message.subject = $scope.messages[0].subject;
                }
            });
        }
    }

    $scope.getSelectedRecipient = function(recipient, type){
        $scope.currentContact = recipient;
        $scope.currentContact.type = type;
        $scope.getHistoryOfMessages($scope.currentContact);
    }

    $scope.replyMessage = function(){
        $scope.message.from = $rootScope.account;
        $scope.message.to = [];

        if($scope.messages.length > 0) {
            $scope.message.to.push({account: $scope.currentContact, type: $scope.messages[0].type});
        }
        else{
            var type = checkIfPrivateOrGroup($scope.currentContact);
            $scope.message.to.push({account: $scope.currentContact, type: type});
        }

        socketService.emit('new-message', $scope.message, function(data){
            $scope.messages.push(data.message);
            $scope.message.content = "";
        });
    }

    $scope.sendNewMessage = function(){
        $scope.message.from = $rootScope.account;
        $scope.message.to = [];

        for(i = 0; i < $scope.tags.length; i++){
            $scope.message.to.push({account: $scope.tags[i].account, type: $scope.tags[i].type});
        }

        socketService.emit('new-message', $scope.message, function(data){
            $scope.message.content = "";
        });
    }

    $scope.tags = [
        //{ text: 'Tag1' },
        //{ text: 'Tag2' }
    ];
    $scope.loadTags = function(query) {
        return $http.get('/tags?query=' + query);
    };

    $scope.addRecipient = function(data) {
        var obj = {
            account: data,
            text: data.orgname,
            type: 'private'
        };
        $scope.tags.push(obj);
    };

    $scope.addGroup = function(data){
        var obj = {
            account: data,
            text: data.title,
            type: 'group'
        }

        $scope.tags.push(obj);
    }

    $scope.getSenderPicture = function(id){
        accountService.getSenderPicture(id).then(function(response){
           if(response.data.status){
               //var picture = "data:image/png;base64,"+response.data.picture;
               return response.data.picture;
           }
        });
    }

    function checkIfPrivateOrGroup(contact){
        var privateIndex = $scope.connectedAccounts.findIndex(function(account){
            return account._id == contact._id;
        });

        var groupIndex = $scope.collaboratedProjects.findIndex(function(project){
            return project._id == contact._id;
        });

        if(privateIndex > -1 && groupIndex == -1){
            return 'private';
        }
        else if(groupIndex > -1 && privateIndex == -1){
            return 'group';
        }
    }
});