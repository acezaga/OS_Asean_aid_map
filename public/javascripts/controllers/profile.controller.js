angular.module('sbAdminApp')
    .controller('organizationProfileController', function($scope, $rootScope, accountService, socketService, Authentication, $location, projectService, $state) {
        Authentication.authentication();

        $scope.tab = 1;

        $scope.setTab = function(newTab){
            $scope.tab = newTab;
        };

        $scope.isSet = function(tabNum){
            return $scope.tab === tabNum;
        };

        $scope.checkOwnership = function(){
            console.log('check ownership executed');

            var parameters = $location.search();
            console.log('param: '+parameters.name);
            //console.log('account name: '+$rootScope.selectedAccount.username);
            if(!$rootScope.selectedAccount || $rootScope.selectedAccount != parameters.name){
                if(parameters.name){
                    console.log('data: '+parameters.name);
                    accountService.getOrganizationProfile(parameters.name).then(function(response){
                        if(response.data.status){
                            $rootScope.selectedAccount = response.data.account;
                            // added it here
                            if($rootScope.authentication) {
                                if ($rootScope.selectedAccount._id === $rootScope.account._id) {
                                    $scope.owner = true;
                                }
                                else {
                                    $scope.owner = false;
                                    checkIfConnected();
                                }
                            }
                            $scope.getOngoingProjects();
                            $scope.getPortfolio();
                        }
                    });
                }
                else {
                    $rootScope.selectedAccount = $rootScope.account;
                    $scope.owner = true;
                }
            }
            else if($rootScope.selectedAccount._id == $rootScope.account._id){
                $scope.owner = true;
                $scope.getOngoingProjects();
                $scope.getPortfolio();
            }
            else{
                $scope.owner = false;
                checkIfConnected();
                $scope.getOngoingProjects();
                $scope.getPortfolio();
            }
        };

        function checkIfConnected(){
            var index = $rootScope.account.connections.indexOf($rootScope.selectedAccount._id);
            console.log('index: '+index);

            if(index > -1)
                $scope.connected = true;
            else
                $scope.connected = false;

            //(index > -1) ? $scope.connected = true : $scope.connected = false;

            if(!$scope.connected) {
                var data = {};
                data.fromId = $rootScope.account._id;
                data.toId = $rootScope.selectedAccount._id;
                accountService.checkIfRequested(data).then(function (response) {
                    if (response.data) {
                        console.log('requested');
                        $scope.requested = true;
                    }
                    else {
                        var penData = {};
                        penData.fromId = $rootScope.selectedAccount._id;
                        penData.toId = $rootScope.account._id;

                        console.log('not requested');
                        $scope.requested = false;

                        accountService.checkIfPending(penData).then(function(response){
                            if(response.data){
                                $scope.pendingReq = true;
                            }
                            else{
                                $scope.pendingReq = false;
                            }
                        });
                    }
                });
            }
        };

        $rootScope.$on("RefreshConnectionCheck", function(event, args){
            //checkIfConnected();
            $scope.checkOwnership();
        });

        $scope.addConnection = function(){

            console.log('connection request clicked');

            var conn = {};
            conn.to = $rootScope.selectedAccount;
            conn.from = $rootScope.account;

            socketService.emit('new-connection', conn, function(data){
                if(data.status){
                    console.log('request for collaboration sent');
                    $scope.requested = true;
                }
            });
        };

        $scope.removeConn = function(){
            var conn = {};
            conn.to = $rootScope.selectedAccount;
            conn.from = $rootScope.account;

            socketService.emit('remove-connection', conn, function(data){
                console.log('a remove attempt successful '+data);

                $rootScope.account = data;
                Authentication.setCredentials(data);
                checkIfConnected();
            });
        };

        $scope.getOngoingProjects = function(){
            projectService.getOngoingProjects($scope.selectedAccount._id).then(function(response){
               if(response.data.status){
                   $scope.ongoingProjects = response.data.projects;
               }
            });
        }

        $scope.getPortfolio = function(){
            projectService.getPortfolio($scope.selectedAccount._id).then(function(response){
                if(response.data.status){
                    $scope.portfolio = response.data.projects;
                }
            });
        }

        $scope.getConnecionsInfo = function(){
            accountService.getConnectionInfo($scope.selectedAccount.connections).then(function(response){
               $scope.selectedAccount.connections = response.data;
            });
        }

        $scope.getResourceIcon = function(resource){
            return getResourceIcon(resource);
        }

        $scope.onClickProjectName = function(project){
            //$rootScope.selectedProject = project;
            $location.url('/dashboard/projprofile?name='+project.title);
            //$state.go('dashboard.projectprofile');
        };

        $scope.onClickOrgName = function(account){
            //$rootScope.selectedAccount = account;
            $location.url('/dashboard/orgprofile?name='+account.username);
            //$state.reload();
            //$state.go('dashboard.orgprofile');
        };

        $scope.cancelConnectionRequest = function(){
            var conn = {};
            conn.to = $rootScope.selectedAccount;
            conn.from = $rootScope.account;

            socketService.emit('cancel-connection-request', conn, function(data){
                if(data.status){
                    $scope.requested = false;
                }
            });
        }
});

angular.module('sbAdminApp')
    .controller('projectProfileController', function($scope, $rootScope, socketService, Authentication, projectService, accountService, $location, toaster){
        Authentication.authentication();

        // variables for application
        $scope.applicationMessage = "";
        $scope.applicationSubject = "";
        $scope.collabRequestedAccounts = [];

        // variables for invitation
        $scope.searchedUserField = "";
        $scope.searchedUser = [];
        $scope.connectedAccounts = [];
        $scope.suggestedAccounts = [];
        $scope.invitedAccounts = [];
        $scope.invitationList = [];
        $scope.invitationMessage = "";
        $scope.invitationSubject = "";
        $scope.removedConnection = [];
        $scope.removedSuggestion = [];


        //variables of donation
        if($rootScope.selectedProject) {
            $scope.donationResources = $rootScope.selectedProject.resources;
        }

        $scope.tabSide = 1;
        $scope.tabTop = 1;

        $scope.setTabSide = function(newTab){
            $scope.tabSide = newTab;
        };

        $scope.isSetSide = function(tabNum){
            return $scope.tabSide === tabNum;
        };

        $scope.checkOwnership = function(){
            console.log('check ownership executed');

            var parameters = $location.search();
            //if(!$rootScope.selectedProject || $rootScope.selectedProject.title != parameters.name){
                console.log('url parameters check is executed');
                if(parameters.name){
                    console.log('data: '+parameters.name);
                    projectService.getProject(parameters.name).then(function(response){
                        if(response.data.status){
                            $rootScope.selectedProject = response.data.project;

                            console.log('project id: '+$rootScope.selectedProject._id);

                            projectService.getCreator($rootScope.selectedProject.creator).then(function(response){
                                delete response.data.password;
                                $rootScope.selectedProject.creator = response.data;

                                getInvitedAccounts();
                                $scope.checkIfSummaryWasCreated();
                                // added it here
                                if($rootScope.selectedProject.creator._id === $rootScope.account._id){
                                    $scope.owner = true;
                                }
                                else{
                                    $scope.owner = false;

                                    console.log('collaboration: '+JSON.stringify($rootScope.selectedProject.collaboration));

                                    var index = $rootScope.selectedProject.collaboration.indexOf($rootScope.account._id);

                                    console.log('index collab: '+index);

                                    if(index > -1)
                                        $scope.collaborated = true;
                                    else
                                        $scope.collaborated = false;

                                    if(!$scope.collaborated) {
                                        var data = {};
                                        data.fromId = $rootScope.account._id;
                                        data.toId = $rootScope.selectedProject.creator._id;
                                        data.projectId = $rootScope.selectedProject._id;
                                        projectService.checkIfSingleCollabRequested(data).then(function (response) {
                                            console.log('single collab check executed');
                                            if (response.data.status) {
                                                $scope.requested = true;
                                                console.log('request true');
                                            }
                                            else {
                                                $scope.requested = false;
                                                console.log('request false');
                                                //if($scope.checkIfAccountIsInvited($rootScope.account)){
                                                //    console.log('invited');
                                                //    $scope.invited = true;
                                                //}
                                                //else{
                                                //    $scope.invited = false;
                                                //}
                                            }
                                        });
                                    }
                                }

                                $scope.donationResources = $rootScope.selectedProject.resources;
                                getCollaboratorsInfo($rootScope.selectedProject);
                            });
                        }
                    });
                }
            //}
            //else if($rootScope.selectedProject.creator._id == $rootScope.account._id){
            //    $scope.owner = true;
            //    getCollaboratorsInfo($rootScope.selectedProject);
            //}
            //else{
            //    $scope.owner = false;
            //
            //    var index = $rootScope.selectedProject.collaboration.indexOf($rootScope.account._id);
            //
            //    console.log('index collab: '+index);
            //
            //    if(index > -1)
            //        $scope.collaborated = true;
            //    else
            //        $scope.collaborated = false;
            //
            //    if(!$scope.collaborated) {
            //        var data = {};
            //        data.fromId = $rootScope.account._id;
            //        data.toId = $rootScope.selectedProject.creator._id;
            //        data.projectId = $rootScope.selectedProject._id;
            //        projectService.checkIfCollabRequested(data).then(function (response) {
            //            if (response.data) {
            //                $scope.requested = true;
            //            }
            //            else {
            //                $scope.requested = false
            //            }
            //        });
            //    }
            //
            //    getCollaboratorsInfo($rootScope.selectedProject);
            //}
        };

        $scope.setTabTop = function(newTab){
            $scope.tabTop = newTab;
        };

        $scope.isSetTop = function(tabNum){
            return $scope.tabTop === tabNum;
        };

        $scope.applyCollaboration = function(){

            console.log('apply collaboration request clicked');

            var collab = {};
            collab.to = $rootScope.selectedProject.creator;
            collab.from = $rootScope.account;
            collab.project = $rootScope.selectedProject;
            collab.purpose = $scope.applicationMessage;
            collab.subject = $scope.applicationSubject;

            socketService.emit('new-apply-collaboration', collab, function(data){
                if(data.status){
                    console.log('request for collaboration sent');
                    $scope.requested = true;
                    toaster.pop('success', "Application Sent", "Application for Collaboration was Sent");
                    $('#applyCollab').modal('toggle');
                }
            });
        };

        $scope.inviteCollaboration = function(){

            for(i = 0; i < $scope.tags.length; i++){
                $scope.invitationList.push($scope.tags[i].account);
            }

            var invitation = {};

            invitation.to = $scope.invitationList;
            invitation.from = $rootScope.account;
            invitation.project = $rootScope.selectedProject;
            invitation.message = $scope.invitationMessage;
            invitation.subject = $scope.invitationSubject;

            socketService.emit('new-invite-collaboration', invitation, function(data){
                if(data.status){
                    console.log('invitation for collaboration sent');
                    $scope.invitationList = [];

                    data.invitedAccounts.forEach(function(account){
                        $scope.invitedAccounts.push(account);
                    });

                    $scope.tags = [];
                    $scope.invitationMessage = "";
                    $scope.invitationSubject = "";

                    toaster.pop('success', "Invitation Sent", "Invitation for Collaboration was Sent");
                    $('#inviteCollabMessage').modal('toggle');
                }
            });
        };

        $rootScope.$on('RefreshCollabCheck', function(event, args){
            if(args.project) {
                $rootScope.selectedProject = args.project;
            }
            $scope.checkOwnership();
        });

        $rootScope.$on('AcceptedDonation', function(event, args){
            if(args.project) {
                $rootScope.selectedProject = args.project;
            }
           $scope.checkOwnership();
        });

        function getInvitedAccounts() {
            var data = {};
            data.account = $rootScope.selectedProject.creator._id;
            data.project = $rootScope.selectedProject._id;
            //$scope.invitedAccounts = accountService.getInvitedCollaborators(data);
            accountService.getInvitedCollaborators(data).then(function(response){
                if(response.data.status) {
                    $scope.invitedAccounts = response.data.accounts;

                    if($scope.checkIfAccountIsInvited($rootScope.account)){
                        console.log('invited');
                        $scope.invited = true;
                    }
                    else{
                        $scope.invited = false;
                    }
                }
                console.log('received invited accounts: '+JSON.stringify($scope.invitedAccounts));
            });
        }

       /* };*/

        $scope.tags = [
            //{ text: 'Tag1' },
            //{ text: 'Tag2' }
        ];
        $scope.loadTags = function(query) {
            return $http.get('/tags?query=' + query);
        };

        $scope.removeTag = function(tag){
            var accountId = tag.account._id;

            var index = -1, suggestedIndex = -1;

            if($scope.removedConnection.length > 0){
                index = $scope.removedConnection.findIndex(function(account){
                    return account._id == accountId;
                });
            }

            if($scope.removedSuggestion.length > 0){
                suggestedIndex = $scope.removedSuggestion.findIndex(function(account){
                    return account._id == accountId;
                });
            }

            console.log('remove tag index: '+index + " " + suggestedIndex);

            if(index > -1){
                var addedConnectedAccount = $scope.removedConnection.splice(index,1);
                addedConnectedAccount.forEach(function(account){
                    $scope.connectedAccounts.push(account);
                });
            }

            if(suggestedIndex > -1){
                var addedSuggestedAccount = $scope.removedSuggestion.splice(suggestedIndex,1);
                addedSuggestedAccount.forEach(function(account){
                    $scope.suggestedAccounts.push(account);
                });
            }
        }

        $scope.addRecipient = function(data) {
            var obj = {
                account: data,
                text: data.orgname
            };
            $scope.tags.push(obj);

            var index = -1, suggestedIndex = -1;

            if($scope.connectedAccounts.length > 0) {
                index = $scope.connectedAccounts.findIndex(function (account) {
                    return account._id == data._id;
                });
            }

            if($scope.suggestedAccounts.length > 0) {
                suggestedIndex = $scope.suggestedAccounts.findIndex(function (account) {
                    return account._id == data._id;
                });
            }

            console.log('invite index: '+index + " " + suggestedIndex);

            if(index > -1){
                var removedConnectedAccount = $scope.connectedAccounts.splice(index,1);
                removedConnectedAccount.forEach(function(account){
                    $scope.removedConnection.push(account);
                });
                console.log('removed connection: '+JSON.stringify($scope.removedConnection));
            }

            if(suggestedIndex > -1){
                var removedSuggestedAccount = $scope.suggestedAccounts.splice(index, 1);
                removedSuggestedAccount.forEach(function(account){
                    $scope.removedSuggestion.push(account);
                });
                console.log('removed suggestion: '+JSON.stringify($scope.removedSuggestion));
            }
        };

        $scope.checkIfAccountIsInvited = function(account){
            //console.log('invited accounts: '+JSON.stringify($scope.invitedAccounts));
            for(i = 0; i < $scope.invitedAccounts.length; i++){
                var invitedAccount = $scope.invitedAccounts[i]._id;
                if(account._id == invitedAccount){
                    return true;
                }
            }

            return false;
        }

        $scope.checkIfAccountRequested = function(account){
            //var data = {};
            //data.fromId = account._id;
            //data.toId = $rootScope.selectedProject.creator._id;
            //data.projectId = $rootScope.selectedProject._id;
            //projectService.checkIfCollabRequested(data).then(function(response){
            //    if(response.data.status){
            //        return true;
            //    }
            //    else{
            //        return false;
            //    }
            //});

            for(i = 0; i < $scope.collabRequestedAccounts.length; i++){
                var invitedAccount = $scope.collabRequestedAccounts[i];
                if(account._id == invitedAccount){
                    return true;
                }
            }

            return false;
        }

        $scope.retrieveConnectedAccounts = function(){
            accountService.getConnectionInfo($rootScope.account.connections).then(function(response){
                console.log('response: '+response.data);
                $scope.connectedAccounts = response.data;
                for(i = 0; i < $scope.selectedProject.collaboration.length; i++){
                    var col = $scope.selectedProject.collaboration[i];
                    var index = $scope.connectedAccounts.findIndex(function(element){
                        return element._id == col._id;
                    });

                    console.log('connCollab index: '+index);

                    if(index > -1){
                        $scope.connectedAccounts.splice(index, 1);
                    }
                }
            });

            accountService.getSuggestedAccountsToProject($rootScope.selectedProject).then(function(response){
                if(response.data.status) {
                    $scope.suggestedAccounts = response.data.accounts;
                    for (i = 0; i < $scope.selectedProject.collaboration.length; i++) {
                        var col = $scope.selectedProject.collaboration[i];
                        var index = $scope.suggestedAccounts.findIndex(function (element) {
                            return element._id == col._id;
                        });

                        console.log('connCollab index: ' + index);

                        if (index > -1) {
                            $scope.suggestedAccounts.splice(index, 1);
                        }
                    }
                }
            });

            var data = {};
            //data.fromId = account._id;
            data.toId = $rootScope.selectedProject.creator._id;
            data.projectId = $rootScope.selectedProject._id;

            projectService.checkIfCollabRequested(data).then(function(response){
                if(response.data.status){
                    response.data.notifications.forEach(function(notification){
                        console.log('check for collab account executed: '+notification.from.id);
                        $scope.collabRequestedAccounts.push(notification.from.id);
                    });
                }
            });
        }

        $scope.searchForUser = function(){
            console.log('search parameter: '+$scope.searchedUserField);
            accountService.getSearchUser($scope.searchedUserField).then(function(response){
                if(response.data.status){
                    console.log('searched user triggered');
                    $scope.searchedUser = response.data.accounts;
                }
            });
        }

        function retrieveSuggestedAccounts(){
            accountService.getSuggestedAccounts($rootScope.account).then(function(response){
                return response.data.accounts;
            });
        }

        $scope.checkNeededResource = function(qty, inhand){
            var needed = qty - inhand;
            return needed;
        }

        $scope.checkAvailOfResource = function(resource){
            for(i = 0; i < $rootScope.account.resources.length; i++){
                var res = $rootScope.account.resources[i];
                if(res.type == resource.type){
                    if(resource.description){
                        if(res.description == resource.description){
                            return res.quantity;
                        }
                    }
                    else{
                        return res.quantity;
                    }
                }
            }

            return 'Not Available';
        }

        $scope.sendDonation = function(){
            var donatedResources = [];

            for(i = 0; i < $scope.donationResources.length; i++){
                if($scope.donationResources[i].donated > 0){
                    delete $scope.donationResources[i].$$hashKey;
                    donatedResources.push($scope.donationResources[i]);
                }
            }

            var donation = {};

            donation.to = $rootScope.selectedProject.creator;
            donation.from = $rootScope.account;
            donation.project = $rootScope.selectedProject;
            donation.donated = donatedResources;

            socketService.emit('new-donation', donation, function(data){
                if(data.status){
                    toaster.pop('success', "Donation Sent", "Donation was sent to the organization");
                    $('#donateNow').modal('toggle');
                }
            });
        }

        $scope.editProjectProfile = function() {
            $location.url('/dashboard/editproject?name='+$rootScope.selectedProject.title);
        }

        function getCollaboratorsInfo (project){
            projectService.getCollaboratorInfo(project.collaboration).then(function(response){
                if(response.data.status){
                    console.log('collaborators info gathered');
                    project.collaboration = response.data.collaborators;
                }
            })
        }

        $scope.getProgressDate = function(){
            console.log('getting of progress date executed');
            var targetDate = new Date($rootScope.selectedProject.endDate);
            var beginDate = new Date($rootScope.selectedProject.startDate);
            var totalTime = (targetDate - beginDate);
            //$scope.totalTimeDate = totalTime;
            var dateProgress = new Date() - beginDate;
            $scope.completionPercentage = (Math.round((dateProgress / totalTime) * 100));
            //return completionPercentage;
        }

        $scope.getResourceIcon = function(resource){
            var resourceIcon = getResourceIcon(resource);
            return resourceIcon;
        }

        $scope.checkIfSummaryWasCreated = function(){
            projectService.getProjectSummary($rootScope.selectedProject._id).then(function(response){
                if(response.data.status){
                    $scope.hasSummary = true;
                }
                else{
                    $scope.hasSummary = false;
                }
            });
        }

        $scope.createSummary = function(){
            $location.url('/dashboard/createprojsummary?name='+$rootScope.selectedProject.title);
        }

        $scope.viewSummary = function(){
            $location.url('/dashboard/projectsummary?name='+$rootScope.selectedProject.title);
        }

        $scope.cancelApplyCollaborationRequest = function(){
            var collab = {};
            collab.to = $rootScope.selectedProject.creator;
            collab.from = $rootScope.account;
            collab.project = $rootScope.selectedProject;

            socketService.emit('cancel-collaboration-application-request', collab, function(data){
                if(data.status){
                    $scope.requested = false;
                }
            });
        }

        $scope.cancelInviteCollaborationRequest = function(account){
            var invitation = {};
            invitation.to = account;
            invitation.from = $rootScope.account;
            invitation.project = $rootScope.selectedProject;

            socketService.emit('cancel-collaboration-invite-request', invitation, function(data){
                if(data.status){
                    var index = $scope.invitedAccounts.findIndex(function(invAccount){
                        return invAccount._id == account._id;
                    });

                    $scope.invitedAccounts.splice(index, 1);
                }
            });
        }
});

function getResourceIcon(resource){
    switch (resource){
        case 'Food Supply':
            return 'shopping-cart';
        case 'Money':
            return 'money';
        case 'Human Resource':
            return 'group';
        case 'Tools and Equipment':
            return 'truck';
        case 'Medical Supplies':
            return 'medkit';
        case 'Clothes and Personal Necessities':
            return 'suitcase';
        case 'School and Office Supplies':
            return 'pencil';
        case 'School and Office Utilities':
            return 'book';
        case 'Construction Supplies':
            return 'wrench';
    }
}
