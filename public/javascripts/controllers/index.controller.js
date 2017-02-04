/**
 * Created by Asus on 11/6/2016.
 */

angular.module('sbAdminApp').controller('indexProfileController', function($scope, $rootScope, $http, $state, Authentication, socketService, $location){
    $scope.logout = function(){
        //$rootScope.account = null;
        //$rootScope.authentication = false;
        socketService.emit('disconnect', $rootScope.account._id);
        Authentication.removeCredentials();
        $state.go('dashboard.home');
    };

    $scope.profile = function(){
        $rootScope.selectedAccount = $rootScope.account;
        $location.url('/dashboard/orgprofile?name='+$rootScope.account.username);
        $rootScope.$emit('RefreshConnectionCheck', {});
        //$state.go('dashboard.orgprofile');
    };
});

angular.module('sbAdminApp').controller('inboxController', function($scope, $rootScope, $http, $location, socketService, Authentication, accountService, projectService){
    Authentication.authentication();

    $scope.unseenMessage = 0;

    var data = {}
    data.id = $rootScope.account._id;
    data.groups = [];

    $scope.messages = [];

    projectService.getCollaboratedProjects($rootScope.account._id).then(function(response){
        if(response.data.status) {
            $scope.collaboratedProjects = response.data.projects;

            //$scope.collaboratedProjects.forEach(function(project){
            //    socketService.emit('join-room', project._id);
            //});

            $scope.collaboratedProjects.forEach(function(group){
                data.groups.push(group._id);
            });
        }

        socketService.emit('all-chat-history', data, function(historyMessages){
            if(historyMessages.status){
                $scope.messages = historyMessages.messages;

                checkUnseenCount();
            }
        });
    });

    socketService.on('new-message', function(data){
        var index = $scope.messages.findIndex(function(message){
                        return message.from.id == data.message.from.id;
                    });

        if(index > -1){
            $scope.messages.splice(index, 1);
            $scope.messages.unshift(data.message);
        }
        else {
            $scope.messages.unshift(data.message);
        }

        checkUnseenCount();
    });

    $scope.goToChatBox = function(account){

    }

    $scope.changeSeenMessage = function(){
        var messageTobeUpdated = [];

        $scope.messages.forEach(function(message){
            if(!message.seen){
                message.seen = true;
                messageTobeUpdated.push(message);
            }
        });

        if(messageTobeUpdated.length > 0){
            socketService.emit('change-seen-message', messageTobeUpdated);
            $scope.unseenMessage = 0;
        }
    }

    function checkUnseenCount(){
        $scope.messages.forEach(function(message){
            if(!message.seen){
                $scope.unseenMessage++;
            }
        });
    }

});

angular.module('sbAdminApp').controller('notificationController', function($scope, $rootScope, $http, $state, socketService, accountService, projectService, Authentication, $location){
    Authentication.authentication();

    $scope.currentStatistic = {};

    $scope.unseenNotif = 0;

    $scope.notifications = [];

    accountService.getNotification($rootScope.account._id).then(function(response){
        $scope.notifications = response.data;
        $scope.notifications.reverse();
        checkUnseenCount();
    });

    socketService.on('new-connection', function(data){

        console.log('new connection received');

        $scope.notifications.unshift(data);
        checkUnseenCount();

        $rootScope.$emit("RefreshConnectionCheck", {});
    });

    socketService.on('response-connection', function(data){

        console.log('a response from connection request received');

        if(!data.account){
            $scope.notifications.unshift(data.notification);

            $rootScope.$emit("RefreshConnectionCheck", {});
        }
        else {
            $scope.notifications.unshift(data.notification);
            $rootScope.account = data.account;
            Authentication.setCredentials(data.account);

            $rootScope.$emit("RefreshConnectionCheck", {});
        }

        checkUnseenCount();
    });

    socketService.on('remove-connection', function(data){

        //$scope.notifications.unshift(data.notification);
        $rootScope.account = data.account;
        Authentication.setCredentials(data.account);
        checkUnseenCount();
    });

    socketService.on('new-apply-collaboration', function(data){

        console.log('new application for collaboration received');

        $scope.notifications.unshift(data);
        checkUnseenCount();

        $rootScope.$emit("RefreshCollabCheck", {});
    });

    socketService.on('response-apply-collaboration', function(data){
        $scope.notifications.unshift(data.notification);
        $rootScope.$emit("RefreshCollabCheck", {project: data.project});

        if(data.notification.answer) {
            socketService.emit('join-room', data.notification.to.project._id);
        }
    });

    socketService.on('new-invite-collaboration', function(data){

        console.log('new invitation for collaboration received');

        $scope.notifications.unshift(data);
        checkUnseenCount();

        $rootScope.$emit("RefreshCollabCheck", {});
    });

    socketService.on('response-invite-collaboration', function(data){
        $scope.notifications.unshift(data.notification);
        $rootScope.$emit("RefreshCollabCheck", {});

        if(data.notification.answer) {
            socketService.emit('join-room', data.notification.from.project._id);
        }
    });

    socketService.on('new-donation', function(data){
        console.log('new invitation for collaboration received');

        $scope.notifications.unshift(data);
        checkUnseenCount();
    });

    socketService.on('response-donation', function(data){
        console.log('response donation received');
        if(data.notification.answer) {
            $rootScope.account = data.account;
            Authentication.setCredentials(data.account);
            $rootScope.$emit('AcceptedDonation', {project: data.project});
        }
        $scope.notifications.unshift(data.notification);

        checkUnseenCount();
    });

    socketService.on('cancel-connection-request', function(data){
       var index = $scope.notifications.findIndex(function(notification){
                    return notification._id == data.notification._id;
                });

       if(index > -1){
           $scope.notifications.splice(index, 1);
       }

        $rootScope.$emit("RefreshConnectionCheck", {});
    });

    socketService.on('cancel-collaboration-application-request', function(data){
        var index = $scope.notifications.findIndex(function(notification){
            return notification._id == data.notification._id;
        });

        if(index > -1){
            $scope.notifications.splice(index, 1);
        }

        $rootScope.$emit("RefreshCollabCheck", {});
    });

    socketService.on('cancel-collaboration-invite-request', function(data){
        var index = $scope.notifications.findIndex(function(notification){
            return notification._id == data.notification._id;
        });

        if(index > -1){
            $scope.notifications.splice(index, 1);
        }

        $rootScope.$emit("RefreshCollabCheck", {});
    });

    $scope.answerConnection = function(answer, notification){
        var notif = {};
        notif.to = notification.from;
        notif.account = $rootScope.account;
        notif.notif = notification;
        notif.response = answer;

        socketService.emit('response-connection', notif, function(data){
            if(data.account) {
                console.log('response account:' + data);
                $rootScope.account = data.account;
                Authentication.setCredentials(data.account);

                for (i = 0; i < $scope.notifications.length; i++) {
                    if ($scope.notifications[i]._id == data.notification._id) {
                        $scope.notifications[i] = data.notification;
                    }
                }
            }
            else{
                for (i = 0; i < $scope.notifications.length; i++) {
                    if ($scope.notifications[i]._id == data.notification._id) {
                        $scope.notifications[i] = data.notification;
                    }
                }
            }
            //$scope.notifications.forEach(function(notification){
            //    if(notification._id == data.notification._id){
            //        notification = data.notification;
            //    }
            //});
        });
    };

    $scope.answerCollaboration = function(answer, notification){
        var notif = {};
        notif.notif = notification;
        notif.response = answer;

        socketService.emit('response-apply-collaboration', notif, function(data){
            for(i = 0; i < $scope.notifications.length; i++){
                if($scope.notifications[i]._id == data.notification._id){
                    $scope.notifications[i] = data.notification;
                    console.log('notification changed');
                }
            }

            //$scope.notifications.forEach(function(notification){
            //    if(notification._id == data.notification._id){
            //        notification = data.notification;
            //    }
            //});
        });
    };

    $scope.answerInviteCollaboration = function(answer, notification){
        var notif = {};
        notif.notif = notification;
        notif.response = answer;

        socketService.emit('response-invite-collaboration', notif, function(data){
            for(i = 0; i < $scope.notifications.length; i++){
                if($scope.notifications[i]._id == data.notification._id){
                    $scope.notifications[i] = data.notification;
                    console.log('notification changed');
                }
            }

            if(data.notification.answer) {
                socketService.emit('join-room', data.notification.from.project._id);
                $rootScope.$emit('RefreshCollabCheck', {project: data.project});
            }
            //$scope.notifications.forEach(function(notification){
            //    if(notification._id == data.notification._id){
            //        notification = data.notification;
            //    }
            //});
        });
    };

    $scope.answerDonation = function(answer, notification){
        var notif = {};
        notif.notif = notification;
        notif.response = answer;

        socketService.emit('response-donation', notif, function(data){
            for(i = 0; i < $scope.notifications.length; i++){
                if($scope.notifications[i]._id == data.notification._id){
                    $scope.notifications[i] = data.notification;
                    console.log('notification changed');
                }
            }

            //$scope.notifications.forEach(function(notification){
            //    if(notification._id == data.notification._id){
            //        notification = data.notification;
            //    }
            //});
        });
    }

    function checkUnseenCount(){
        $scope.notifications.forEach(function(notification){
           if(!notification.seen){
               $scope.unseenNotif++;
           }
        });
    }

    $scope.changeSeenNotif = function(){
        var notifTobeUpdated = [];

        $scope.notifications.forEach(function(notification){
            if(!notification.seen){
                notification.seen = true;
                notifTobeUpdated.push(notification);
            }
        });

        if(notifTobeUpdated.length > 0){
            socketService.emit('change-seen-notif', notifTobeUpdated);
            $scope.unseenNotif = 0;
        }
    }

    $scope.checkCollabStats = function(accountId, projectId){
        var account = {};
        var project = {};
        accountService.getAccountById(accountId).then(function(accountResponse){
            if(accountResponse.data.status){
                account = accountResponse.data.account;
            }

            projectService.getProjectById(projectId).then(function(projectResponse){
                if(projectResponse.data.status){
                    project = projectResponse.data.project;
                }

                //$scope.currentStatistic.date = new Date() - new Date(project.startDate);
                $scope.currentStatistic.date = Math.round((new Date() - new Date(project.startDate))/(1000*60*60*24));

                var overallCollab = project.collaboration.length;
                var overAllSectors = project.sector.length;
                var overAllResources = project.resources.length;

                //var matchedLocation = 0;
                $scope.projectLocation = project.address.city+", "+project.address.country;
                $scope.matchedConnCollab = 0;
                var matchedSectors = 0;
                //var matchedResources = 0;
                $scope.matchedResources = [];

                $scope.currentStatistic.matchedSector = [];

                //if(account.country == project.address.country){
                //    matchedLocation = 50;
                //}

                for(i = 0; i < account.connections; i++){
                    if(project.collaboration.indexOf(account.connections[i]) > -1){
                        $scope.matchedConnCollab += 1;
                    }
                }

                for(i = 0; i < account.sectors.length; i++){
                    for(j = 0; j < project.sector.length; j++){
                        if(account.sectors[i].type == project.sector[j].type){
                            matchedSectors += 1;
                            $scope.currentStatistic.matchedSector.push(account.sectors[i].type);
                            break;
                        }
                    }
                }

                for(i = 0; i < account.resources.length; i++){
                    for(j = 0; j < project.resources.length; j++){
                        if(account.resources[i].type == project.resources[j].type){
                            if(account.resources[i].description && project.resources[j].description){
                                if(account.resources[i].description == project.resources[j].description){
                                    //matchedResources += 1;
                                    //console.log('matched desc');
                                    $scope.matchedResources.push({type: project.resources[j].type, description: project.resources[j].description, needed: (project.resources[j].qty - project.resources[j].inhand)});
                                }
                            }
                            else{
                                //console.log('matched type');
                                //matchedResources += 1;
                                $scope.matchedResources.push({type: project.resources[j].type, needed: (project.resources[j].qty - project.resources[j].inhand)});
                            }
                        }
                    }
                }

                //if(matchedConnCollab > 0 && overallCollab > 0) {
                //    $scope.currentStatistic.proximity = matchedLocation + (matchedConnCollab / overallCollab * 50);
                //}
                //else{
                //    $scope.currentStatistic.proximity = matchedLocation;
                //}
                //$scope.currentStatistic.sector = matchedSectors / overAllSectors * 100;
                //$scope.currentStatistic.resources = matchedResources / overAllResources * 100;
                //
                //$scope.currentStatistic.overall = ($scope.currentStatistic.proximity + $scope.currentStatistic.sector + $scope.currentStatistic.resources) / 3;
                //
                //console.log('matched Resources: '+matchedResources+"  overall match: "+overAllResources);
            });

        });
    }

    $scope.checkConnectionStats = function(accountId, requestAccountId){
        $scope.currentStatistic = {};
        var account = {};
        var requestAccount = {};
        accountService.getAccountById(accountId).then(function(accountResponse){
            if(accountResponse.data.status){
                account = accountResponse.data.account;
            }

            accountService.getAccountById(requestAccountId).then(function(accountResponse){
                if(accountResponse.data.status){
                    requestAccount = accountResponse.data.account;
                }

                var overallConnection = requestAccount.connections.length;
                var overAllSectors = requestAccount.sectors.length;
                var overAllResources = requestAccount.resources.length;

                $scope.projectLocation = project.address.city+", "+project.address.country;
                $scope.matchedConnCollab = 0;
                var matchedSectors = 0;
                //var matchedResources = 0;
                $scope.matchedResources = [];

                $scope.currentStatistic.matchedSector = [];

                //if(account.country == requestAccount.country){
                //    matchedLocation = 50;
                //}

                if(requestAccount.connections.length > 0) {
                    for (i = 0; i < account.connections; i++) {
                        if (requestAccount.connections.indexOf(account.connections[i]) > -1) {
                            $scope.matchedConnCollab += 1;
                        }
                    }
                }

                for(i = 0; i < account.sectors.length; i++){
                    for(j = 0; j < requestAccount.sectors.length; j++){
                        if(account.sectors[i].type == requestAccount.sectors[j].type){
                            matchedSectors += 1;
                            $scope.currentStatistic.matchedSector.push(account.sectors[i]);
                            break;
                        }
                    }
                }

                for(i = 0; i < account.resources.length; i++){
                    for(j = 0; j < requestAccount.resources.length; j++){
                        if(account.resources[i].type == requestAccount.resources[j].type){
                            if(account.resources[i].description && requestAccount.resources[j].description){
                                if(account.resources[i].description == requestAccount.resources[j].description){
                                    //matchedResources += 1;
                                    $scope.matchedResources.push({type: project.resources[j].type, description: project.resources[j].description})
                                }
                            }
                            else{
                                //matchedResources += 1;
                                $scope.matchedResources.push({type: project.resources[j].type});
                            }
                        }
                    }
                }

                //if(overallConnection > 0 && matchedConnCollab > 0) {
                //    $scope.currentStatistic.proximity = matchedLocation + (matchedConnCollab / overallConnection * 50);
                //}
                //else{
                //    $scope.currentStatistic.proximity = matchedLocation;
                //}
                //$scope.currentStatistic.sector = matchedSectors / overAllSectors * 100;
                //$scope.currentStatistic.resources = matchedResources / overAllResources * 100;
                //
                //$scope.currentStatistic.overall = ($scope.currentStatistic.proximity + $scope.currentStatistic.sector + $scope.currentStatistic.resources) / 3;
                //
                //console.log('location: '+JSON.stringify(matchedLocation));
                //console.log('connection: '+JSON.stringify(matchedLocation));
                //console.log('match stat: '+JSON.stringify($scope.currentStatistic));
            });

        });


    }

    $scope.setDonationList = function(donation){
        $scope.donationList = donation;
    }

    $scope.goToPerformanceReview = function(project){
        $location.url('/dashboard/performancereview?name='+project);
    }
});

angular.module('sbAdminApp').controller('sidebarController', function($scope, $rootScope, Authentication){
    Authentication.authentication();

    $scope.selectedMenu = 'dashboard';
    $scope.collapseVar = 0;
    $scope.multiCollapseVar = 0;

    $scope.check = function(x){
        if(x==$scope.collapseVar)
            $scope.collapseVar = 0;
        else
            $scope.collapseVar = x;
    };

    $scope.multiCheck = function(y){

        if(y==$scope.multiCollapseVar)
            $scope.multiCollapseVar = 0;
        else
            $scope.multiCollapseVar = y;
    };
});